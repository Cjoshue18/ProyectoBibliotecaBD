-- Nota: Para ejecución local en SQL Server, descomentar las siguientes líneas.
-- En Azure SQL Database la BD se crea desde el portal/CLI y el script se ejecuta directo dentro de ella.
-- USE MASTER;
-- GO
-- CREATE DATABASE Biblioteca_URP;
-- GO
-- USE Biblioteca_URP;
-- GO

CREATE TABLE Facultad (
    id_facultad INT IDENTITY(1,1),
    nombre_facultad VARCHAR(100) NOT NULL,
    CONSTRAINT pk_facultad_id_facultad PRIMARY KEY (id_facultad)
);

CREATE TABLE Lector(
    id_lector INT IDENTITY(1,1),
    tipo_doc VARCHAR(10) NOT NULL,
    numero_doc VARCHAR(20) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50) NULL,
    correo_institucional VARCHAR(100) NOT NULL,
    telefono VARCHAR(15) NULL,
    direccion VARCHAR(200) NULL,
    tipo_lector VARCHAR(20) NOT NULL,
    estado_lector VARCHAR(20) NOT NULL CONSTRAINT df_lector_estado_lector DEFAULT 'Activo',
    id_facultad INT NOT NULL,
    CONSTRAINT pk_lector_id_lector PRIMARY KEY (id_lector),
    CONSTRAINT ck_lector_tipo_doc CHECK (tipo_doc IN ('DNI', 'Pasaporte', 'CE')),
    CONSTRAINT ck_lector_tipo_lector CHECK (tipo_lector IN ('Alumno', 'Docente')),
    CONSTRAINT ck_lector_estado_lector CHECK (estado_lector IN ('Activo', 'Inactivo', 'Suspendido')),
    CONSTRAINT ck_lector_correo_institucional CHECK (correo_institucional LIKE '%@urp.edu.pe'),
    CONSTRAINT uq_lector_documento UNIQUE (tipo_doc, numero_doc),
    CONSTRAINT uq_lector_correo_institucional UNIQUE (correo_institucional),
    CONSTRAINT fk_lector_facultad_id_facultad FOREIGN KEY (id_facultad) REFERENCES Facultad(id_facultad)
        ON DELETE NO ACTION ON UPDATE NO ACTION -- NO ACTION: id_facultad es NOT NULL (SET NULL falla en SQL Server) y evita multiple cascade paths hacia Prestamo
);

CREATE TABLE Alumno(
    id_lector INT,
    codigo_alumno VARCHAR(9) NOT NULL,
    ciclo TINYINT NOT NULL,
    CONSTRAINT fk_alumno_lector_id_lector FOREIGN KEY (id_lector) REFERENCES Lector(id_lector)
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT pk_alumno_id_lector PRIMARY KEY (id_lector),
    CONSTRAINT uq_alumno_codigo_alumno UNIQUE (codigo_alumno),
    CONSTRAINT ck_alumno_codigo_alumno CHECK (LEN(codigo_alumno) = 9 AND codigo_alumno NOT LIKE '%[^0-9]%'),
    CONSTRAINT ck_alumno_ciclo CHECK (ciclo BETWEEN 1 AND 14)
);

CREATE TABLE Docente(
    id_lector INT,
    categoria_docente VARCHAR(20) NOT NULL,
    CONSTRAINT fk_docente_lector_id_lector FOREIGN KEY (id_lector) REFERENCES Lector(id_lector)
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT pk_docente_id_lector PRIMARY KEY (id_lector),
    CONSTRAINT ck_docente_categoria_docente CHECK (categoria_docente IN ('Temporal', 'Principal', 'Titular'))
);

CREATE TABLE Editorial(
    id_editorial INT IDENTITY(1,1),
    nombre_editorial VARCHAR(100) NOT NULL,
    pais_origen VARCHAR(50) NOT NULL,
    CONSTRAINT pk_editorial_id_editorial PRIMARY KEY (id_editorial),
    CONSTRAINT uq_editorial_nombre_editorial UNIQUE (nombre_editorial)
);

CREATE TABLE Libro(
    id_libro INT IDENTITY(1,1),
    titulo VARCHAR(200) NOT NULL,
    CONSTRAINT pk_libro_id_libro PRIMARY KEY (id_libro)
);

CREATE TABLE Autor(
    id_autor INT IDENTITY(1,1),
    nombre_autor VARCHAR(200) NOT NULL,
    CONSTRAINT pk_autor_id_autor PRIMARY KEY (id_autor)
);

CREATE TABLE Libro_Autor(
    id_libro INT NOT NULL,
    id_autor INT NOT NULL,
    CONSTRAINT pk_libro_autor PRIMARY KEY (id_libro, id_autor),
    CONSTRAINT fk_libroautor_libro_id_libro FOREIGN KEY (id_libro) REFERENCES Libro(id_libro)
        ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_libroautor_autor_id_autor FOREIGN KEY (id_autor) REFERENCES Autor(id_autor)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE Edicion(
    isbn VARCHAR(20) NOT NULL,
    numero_edicion SMALLINT NOT NULL,
    anio_publicacion SMALLINT NOT NULL,
    id_editorial INT NOT NULL,
    id_libro INT NOT NULL,
    CONSTRAINT pk_edicion_isbn PRIMARY KEY (isbn),
    CONSTRAINT fk_edicion_editorial_id_editorial FOREIGN KEY (id_editorial) 
        REFERENCES Editorial(id_editorial)
        ON DELETE NO ACTION ON UPDATE NO ACTION, -- NO ACTION: protege integridad historica y evita SET NULL en columna NOT NULL
    CONSTRAINT fk_edicion_libro_id_libro FOREIGN KEY (id_libro)
        REFERENCES Libro(id_libro)
        ON DELETE NO ACTION ON UPDATE NO ACTION, -- NO ACTION: protege ediciones e historial de prestamos frente a borrados accidentales
    CONSTRAINT ck_edicion_numero_edicion CHECK (numero_edicion >= 1),
    CONSTRAINT ck_edicion_anio_publicacion CHECK (anio_publicacion BETWEEN 1900 AND YEAR(GETDATE()))
);

CREATE TABLE Ejemplar(
    isbn VARCHAR(20) NOT NULL,
    numero_copia SMALLINT NOT NULL,
    tipo_estado_fisico VARCHAR(20) NOT NULL CONSTRAINT df_ejemplar_tipo_estado_fisico DEFAULT 'Bueno',
    id_facultad INT NOT NULL,
    CONSTRAINT fk_ejemplar_edicion_isbn FOREIGN KEY (isbn) 
        REFERENCES Edicion(isbn)
        ON DELETE NO ACTION ON UPDATE CASCADE, -- ON UPDATE CASCADE solo sobre isbn (PK natural editable); ON DELETE NO ACTION protege historial de prestamos
    CONSTRAINT pk_ejemplar_isbn_numero_copia PRIMARY KEY (isbn, numero_copia),
    CONSTRAINT ck_ejemplar_numero_copia CHECK (numero_copia >= 1),
    CONSTRAINT ck_ejemplar_tipo_estado_fisico CHECK (tipo_estado_fisico IN ('Bueno', 'Regular', 'Dañado', 'En Reparacion')),
    CONSTRAINT fk_ejemplar_facultad_id_facultad FOREIGN KEY (id_facultad) 
        REFERENCES Facultad(id_facultad)
        ON DELETE NO ACTION ON UPDATE NO ACTION -- NO ACTION: id_facultad es NOT NULL y evita multiple cascade paths hacia Prestamo
);

CREATE TABLE Prestamo(
    id_prestamo INT IDENTITY(1,1),
    fecha_prestamo DATETIME2(0) NOT NULL,
    fecha_vencimiento DATETIME2(0) NOT NULL,
    fecha_devolucion_real DATETIME2(0) NULL,
    tipo_prestamo VARCHAR(20) NOT NULL,
    id_lector INT NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    numero_copia SMALLINT NOT NULL,
    CONSTRAINT pk_prestamo_id_prestamo PRIMARY KEY (id_prestamo),
    CONSTRAINT ck_prestamo_tipo_prestamo CHECK (tipo_prestamo IN ('Sala', 'Domicilio')),
    CONSTRAINT ck_prestamo_fecha_vencimiento CHECK (fecha_vencimiento > fecha_prestamo),
    CONSTRAINT ck_prestamo_fecha_devolucion_real CHECK (fecha_devolucion_real IS NULL OR fecha_devolucion_real >= fecha_prestamo),
    CONSTRAINT fk_prestamo_lector_id_lector FOREIGN KEY (id_lector)
        REFERENCES Lector(id_lector)
        ON DELETE NO ACTION ON UPDATE NO ACTION, -- NO ACTION: protege historial de prestamos y evita multiple cascade paths desde Facultad
    CONSTRAINT fk_prestamo_ejemplar_isbn_numero_copia FOREIGN KEY (isbn, numero_copia)
        REFERENCES Ejemplar(isbn, numero_copia)
        ON DELETE NO ACTION ON UPDATE CASCADE -- Propaga correcciones de ISBN desde Edicion -> Ejemplar -> Prestamo sin multiple cascade paths
);

CREATE TABLE Deuda(
    id_deuda INT IDENTITY(1,1),
    tarifa_diaria DECIMAL(10,2) NOT NULL CONSTRAINT df_deuda_tarifa_diaria DEFAULT 5.00,
    fecha_fin_suspension DATETIME2(0) NULL,
    estado_deuda VARCHAR(20) NOT NULL CONSTRAINT df_deuda_estado_deuda DEFAULT 'Pendiente',
    id_prestamo INT NOT NULL,
    CONSTRAINT pk_deuda_id_deuda PRIMARY KEY (id_deuda),
    CONSTRAINT uq_deuda_id_prestamo UNIQUE (id_prestamo),
    CONSTRAINT ck_deuda_tarifa_diaria CHECK (tarifa_diaria > 0),
    CONSTRAINT ck_deuda_estado_deuda CHECK (estado_deuda IN ('Anulada', 'Pagada', 'Pendiente')),
    CONSTRAINT fk_deuda_prestamo_id_prestamo FOREIGN KEY (id_prestamo)
        REFERENCES Prestamo(id_prestamo)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE Pago(
    id_pago INT IDENTITY(1,1),
    numero_recibo VARCHAR(20) NOT NULL,
    fecha_pago DATETIME2(0) NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    id_deuda INT NOT NULL,
    CONSTRAINT pk_pago_id_pago PRIMARY KEY (id_pago),
    CONSTRAINT uq_pago_id_deuda UNIQUE (id_deuda),
    CONSTRAINT uq_pago_numero_recibo UNIQUE (numero_recibo),
    CONSTRAINT ck_pago_monto_pagado CHECK (monto_pagado > 0),
    CONSTRAINT fk_pago_deuda_id_deuda FOREIGN KEY (id_deuda)
        REFERENCES Deuda(id_deuda)
        ON DELETE NO ACTION ON UPDATE NO ACTION -- NO ACTION: los comprobantes de caja no deben borrarse en cascada
);