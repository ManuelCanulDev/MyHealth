// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MyHealth
 * @notice Ficha medica on-chain: datos criticos, contactos y control de quien puede editar.
 *         Cada despliegue = una ficha (en este hackathon, un titular; en productivo, un contrato por paciente).
 *         La lectura es publica por diseno (QR / emergencia); la escritura solo owner o autorizados.
 */
contract MyHealth {
    address public owner;

    string public alergias;
    string public condiciones;
    string public medicacion;
    string public notaEmergencia;
    /// @notice Enlace a la imagen (https:// o ipfs://). No guardar el binario en cadena: coste y limite de tamano.
    string public fotoUrl;
    string public religion;
    string public numeroSeguroSocial;
    string public tipoSangre;
    /// @notice Nombre, apellido, teléfono y correo del titular (ficha) — en cadena, no en servidor.
    string public perfilNombre;
    string public perfilApellido;
    string public perfilTelefono;
    string public perfilCorreo;

    struct ContactoEmergencia {
        string nombre;
        string parentesco;
        string telefono;
        string email;
        bool activo;
    }

    ContactoEmergencia[] private _contactos;
    mapping(address => bool) public autorizadoParaEditar;

    event PropietarioTransferido(address indexed anterior, address indexed nuevo);
    event AutorizacionCambiada(address indexed cuenta, bool autorizado);
    event DatosMedicosActualizados(address indexed quien, string categoria);
    event ContactoAgregado(uint256 indexed indice, string nombre);
    event ContactoDesactivado(uint256 indexed indice);
    event AlertaLecturaEmergencia(address indexed lector, uint256 timestamp);

    /// @notice Monitoreo: alerta con ubicación aprox. (WGS84 como enteros * 1e6; compatible con el API del mapa)
    bool public mapaEmergenciaActiva;
    uint256 public mapaEmergenciaId;
    int256 public mapaEmergenciaLat1e6;
    int256 public mapaEmergenciaLng1e6;
    string public mapaEmergenciaNombre;
    string public mapaEmergenciaDetalle;
    uint256 public mapaEmergenciaEmitidoEn;
    uint256 private _mapaEmergenciaIdSeq;

    event EmergenciaMapaRegistrada(
        uint256 indexed id,
        int256 lat1e6,
        int256 lng1e6,
        string nombre
    );
    event EmergenciaMapaLimpiada();

    modifier soloPropietario() {
        require(msg.sender == owner, "Solo el propietario");
        _;
    }

    modifier soloEditor() {
        require(
            msg.sender == owner || autorizadoParaEditar[msg.sender],
            "No autorizado para editar"
        );
        _;
    }

    constructor(
        string memory _alergias,
        string memory _condiciones,
        string memory _medicacion
    ) {
        owner = msg.sender;
        alergias = _alergias;
        condiciones = _condiciones;
        medicacion = _medicacion;
    }

    function transferirPropiedad(address nuevo) external soloPropietario {
        require(nuevo != address(0), "Direccion invalida");
        address anterior = owner;
        owner = nuevo;
        emit PropietarioTransferido(anterior, nuevo);
    }

    function setAutorizado(address cuenta, bool permitido) external soloPropietario {
        require(cuenta != address(0), "Direccion invalida");
        autorizadoParaEditar[cuenta] = permitido;
        emit AutorizacionCambiada(cuenta, permitido);
    }

    function actualizarAlergias(string calldata valor) external soloEditor {
        alergias = valor;
        emit DatosMedicosActualizados(msg.sender, "alergias");
    }

    function actualizarCondiciones(string calldata valor) external soloEditor {
        condiciones = valor;
        emit DatosMedicosActualizados(msg.sender, "condiciones");
    }

    function actualizarMedicacion(string calldata valor) external soloEditor {
        medicacion = valor;
        emit DatosMedicosActualizados(msg.sender, "medicacion");
    }

    function actualizarNotaEmergencia(string calldata valor) external soloEditor {
        notaEmergencia = valor;
        emit DatosMedicosActualizados(msg.sender, "notaEmergencia");
    }

    function actualizarFotoUrl(string calldata valor) external soloEditor {
        fotoUrl = valor;
        emit DatosMedicosActualizados(msg.sender, "fotoUrl");
    }

    function actualizarReligion(string calldata valor) external soloEditor {
        religion = valor;
        emit DatosMedicosActualizados(msg.sender, "religion");
    }

    function actualizarNumeroSeguroSocial(string calldata valor) external soloEditor {
        numeroSeguroSocial = valor;
        emit DatosMedicosActualizados(msg.sender, "numeroSeguroSocial");
    }

    function actualizarTipoSangre(string calldata valor) external soloEditor {
        tipoSangre = valor;
        emit DatosMedicosActualizados(msg.sender, "tipoSangre");
    }

    function actualizarPerfilNombre(string calldata valor) external soloEditor {
        perfilNombre = valor;
        emit DatosMedicosActualizados(msg.sender, "perfilNombre");
    }

    function actualizarPerfilApellido(string calldata valor) external soloEditor {
        perfilApellido = valor;
        emit DatosMedicosActualizados(msg.sender, "perfilApellido");
    }

    function actualizarPerfilTelefono(string calldata valor) external soloEditor {
        perfilTelefono = valor;
        emit DatosMedicosActualizados(msg.sender, "perfilTelefono");
    }

    function actualizarPerfilCorreo(string calldata valor) external soloEditor {
        perfilCorreo = valor;
        emit DatosMedicosActualizados(msg.sender, "perfilCorreo");
    }

    function agregarContactoEmergencia(
        string calldata nombre,
        string calldata parentesco,
        string calldata telefono,
        string calldata email
    ) external soloEditor {
        _contactos.push(
            ContactoEmergencia({
                nombre: nombre,
                parentesco: parentesco,
                telefono: telefono,
                email: email,
                activo: true
            })
        );
        uint256 i = _contactos.length - 1;
        emit ContactoAgregado(i, nombre);
    }

    function desactivarContacto(uint256 indice) external soloEditor {
        require(indice < _contactos.length, "Indice invalido");
        _contactos[indice].activo = false;
        emit ContactoDesactivado(indice);
    }

    function totalContactos() external view returns (uint256) {
        return _contactos.length;
    }

    function contactoEmergencia(uint256 indice)
        external
        view
        returns (
            string memory nombre,
            string memory parentesco,
            string memory telefono,
            string memory email,
            bool activo
        )
    {
        require(indice < _contactos.length, "Indice invalido");
        ContactoEmergencia storage c = _contactos[indice];
        return (c.nombre, c.parentesco, c.telefono, c.email, c.activo);
    }

    /**
     * @notice Cualquiera puede registrar una lectura de emergencia (p. ej. personal sanitario
     *         o backend tras escanear QR). Evita acoplar identidad real: sirve para indexar alertas.
     */
    function registrarLecturaEmergencia() external {
        emit AlertaLecturaEmergencia(msg.sender, block.timestamp);
    }

    /**
     * @notice Registra una emergencia para el mapa (same editores que la ficha). Sin floats en cadena: lat/lng * 1e6.
     */
    function registrarEmergenciaMapa(
        int256 lat1e6,
        int256 lng1e6,
        string calldata nombrePaciente,
        string calldata detalle
    ) external soloEditor {
        require(lat1e6 >= -90 * 1_000_000 && lat1e6 <= 90 * 1_000_000, "Latitud invalida");
        require(lng1e6 >= -180 * 1_000_000 && lng1e6 <= 180 * 1_000_000, "Longitud invalida");
        _mapaEmergenciaIdSeq += 1;
        mapaEmergenciaId = _mapaEmergenciaIdSeq;
        mapaEmergenciaActiva = true;
        mapaEmergenciaLat1e6 = lat1e6;
        mapaEmergenciaLng1e6 = lng1e6;
        mapaEmergenciaNombre = nombrePaciente;
        mapaEmergenciaDetalle = detalle;
        mapaEmergenciaEmitidoEn = block.timestamp;
        emit EmergenciaMapaRegistrada(mapaEmergenciaId, lat1e6, lng1e6, nombrePaciente);
    }

    function limpiarEmergenciaMapa() external soloEditor {
        mapaEmergenciaActiva = false;
        emit EmergenciaMapaLimpiada();
    }

    function leerEmergenciaMapa()
        external
        view
        returns (
            bool activa,
            uint256 id,
            int256 lat1e6,
            int256 lng1e6,
            string memory nombre,
            string memory detalle,
            uint256 emitidoEn
        )
    {
        return (
            mapaEmergenciaActiva,
            mapaEmergenciaId,
            mapaEmergenciaLat1e6,
            mapaEmergenciaLng1e6,
            mapaEmergenciaNombre,
            mapaEmergenciaDetalle,
            mapaEmergenciaEmitidoEn
        );
    }
}
