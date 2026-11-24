USE MASTER;
GO

CREATE DATABASE Biblioteca_URP;
GO

USE Biblioteca_URP;
GO

CREATE TABLE Facultad (
    id_facultad INT IDENTITY(1,1),
    nombre_facultad VARCHAR(50) NOT NULL,
    CONSTRAINT pk_facultad_id_facultad PRIMARY KEY (id_facultad)
);

CREATE TABLE Lector(
    id_lector INT IDENTITY(1,1),
    tipo_doc VARCHAR(10) NOT NULL,
    num_doc VARCHAR(10) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellido_pa VARCHAR(50) NOT NULL,
    apellido_ma VARCHAR(50) NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    telefono VARCHAR(15) NULL,
    direccion VARCHAR(200) NULL,
    tipo_lector VARCHAR(10) NOT NULL,
    estado_lector VARCHAR(10) NOT NULL,
    id_facultad INT NOT NULL,
    CONSTRAINT pk_lector_id_lector PRIMARY KEY (id_lector),
    CONSTRAINT ck_lector_tipo_doc CHECK (tipo_doc IN ('DNI', 'Pasaporte', 'CE')),
    CONSTRAINT ck_lector_tipo_lector CHECK (tipo_lector IN ('Estudiante', 'Docente')),
    CONSTRAINT ck_lector_estado_lector CHECK (estado_lector IN ('Activo', 'Inactivo', 'Suspendido')),
    CONSTRAINT fk_lector_facultad_id_facultad FOREIGN KEY (id_facultad) REFERENCES Facultad(id_facultad)
);

CREATE TABLE Alumno(
    id_lector INT,
    codigo_alumno VARCHAR(9) NOT NULL,
    ciclo TINYINT NOT NULL,
    CONSTRAINT fk_alumno_lector_id_lector FOREIGN KEY (id_lector) REFERENCES Lector(id_lector),
    CONSTRAINT pk_alumno_id_lector PRIMARY KEY (id_lector)
);

CREATE TABLE Docente(
    id_lector INT,
    categoria_docente VARCHAR(20) NOT NULL,
    CONSTRAINT fk_docente_lector_id_lector FOREIGN KEY (id_lector) REFERENCES Lector(id_lector),
    CONSTRAINT pk_docente_id_lector PRIMARY KEY (id_lector),
    CONSTRAINT ck_docente_categoria_docente CHECK (categoria_docente IN ('Temporal', 'Principal', 'Titular'))
);

CREATE TABLE Editorial(
    id_editorial INT IDENTITY(1,1),
    nombre_editorial VARCHAR(100) NOT NULL,
    pais_origen VARCHAR(50) NOT NULL,
    CONSTRAINT pk_editorial_id_editorial PRIMARY KEY (id_editorial)
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
    CONSTRAINT fk_libroautor_libro_id_libro FOREIGN KEY (id_libro) REFERENCES Libro(id_libro),
    CONSTRAINT fk_libroautor_autor_id_autor FOREIGN KEY (id_autor) REFERENCES Autor(id_autor)
);

CREATE TABLE Edicion(
    isbn VARCHAR(20) NOT NULL,
    numero_edicion INT NOT NULL,
    anio_publicacion SMALLINT NOT NULL,
    id_editorial INT NOT NULL,
    id_libro INT NOT NULL,
    CONSTRAINT pk_edicion_isbn PRIMARY KEY (isbn),
    CONSTRAINT fk_edicion_editorial_id_editorial FOREIGN KEY (id_editorial) REFERENCES Editorial(id_editorial),
    CONSTRAINT fk_edicion_libro_id_libro FOREIGN KEY (id_libro) REFERENCES Libro(id_libro)
);

CREATE TABLE EJEMPLAR(
    isbn VARCHAR(20) NOT NULL,
    numero_copia INT NOT NULL,
    tipo_estado_fisico VARCHAR(20) NOT NULL,
    id_facultad INT NOT NULL,
    CONSTRAINT fk_ejemplar_edicion_isbn FOREIGN KEY (isbn) REFERENCES Edicion(isbn),
    CONSTRAINT pk_ejemplar_isbn_numero_copia PRIMARY KEY (isbn, numero_copia),
    CONSTRAINT ck_ejemplar_tipo_estado_fisico CHECK (tipo_estado_fisico IN ('Bueno', 'Regular', 'Dañado', 'Extraviado', 'En Reparacion')),
    CONSTRAINT fk_ejemplar_facultad_id_facultad FOREIGN KEY (id_facultad) REFERENCES Facultad(id_facultad)
);

CREATE TABLE PRESTAMO(
    id_prestamo INT IDENTITY(1,1),
    fecha_prestamo DATETIME NOT NULL,
    fecha_vencimiento DATETIME NULL,
    fecha_devolucion_real DATETIME NULL,
    tipo_prestamo VARCHAR(20) NOT NULL,
    id_lector INT NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    numero_copia INT NOT NULL,
    CONSTRAINT pk_prestamo_id_prestamo PRIMARY KEY (id_prestamo),
    CONSTRAINT ck_prestamo_tipo_prestamo CHECK (tipo_prestamo IN ('Sala', 'Domicilio')),
    CONSTRAINT fk_prestamo_lector_id_lector FOREIGN KEY (id_lector) REFERENCES Lector(id_lector),
    CONSTRAINT fk_prestamo_ejemplar_isbn_numero_copia FOREIGN KEY (isbn, numero_copia) REFERENCES EJEMPLAR(isbn, numero_copia)
);

CREATE TABLE DEUDA(
    id_deuda INT IDENTITY(1,1),
    tarifa_diaria DECIMAL(10,2) NOT NULL,
    fecha_fin_suspension DATETIME NOT NULL,
    estado_deuda VARCHAR(20) NOT NULL,
    id_prestamo INT NOT NULL,
    CONSTRAINT pk_deuda_id_deuda PRIMARY KEY (id_deuda),
    CONSTRAINT ck_deuda_estado_deuda CHECK (estado_deuda IN ('anulada', 'Pagada', 'Pendiente'),
    CONSTRAINT fk_deuda_prestamo_id_prestamo FOREIGN KEY (id_prestamo) REFERENCES PRESTAMO(id_prestamo)
);

CREATE TABLE PAGO(
    id_pago INT IDENTITY(1,1),
    numero_recibo VARCHAR(20) NOT NULL,
    fecha_pago DATETIME NOT NULL,
    monto_pago DECIMAL(10,2) NOT NULL,
    id_deuda INT NOT NULL,
    CONSTRAINT pk_pago_id_pago PRIMARY KEY (id_pago),
    CONSTRAINT fk_pago_deuda_id_deuda FOREIGN KEY (id_deuda) REFERENCES DEUDA(id_deuda)
);