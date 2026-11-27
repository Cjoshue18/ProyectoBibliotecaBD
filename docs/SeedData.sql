-- Datos semilla idempotentes para pruebas de Biblioteca URP (13 tablas)
-- Ejecutar después de ModeloFísico.sql

-- 1. Facultad (8 facultades URP)
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Ingeniería')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Ingeniería');
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Medicina Humana')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Medicina Humana');
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Arquitectura y Urbanismo')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Arquitectura y Urbanismo');
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Ciencias Biológicas')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Ciencias Biológicas');
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Ciencias Económicas y Empresariales')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Ciencias Económicas y Empresariales');
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Derecho y Ciencia Política')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Derecho y Ciencia Política');
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Humanidades y Lenguas Modernas')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Humanidades y Lenguas Modernas');
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Psicología')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Psicología');

DECLARE @idFacIng INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Ingeniería');
DECLARE @idFacMed INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Medicina Humana');
DECLARE @idFacArq INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Arquitectura y Urbanismo');
DECLARE @idFacBio INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Ciencias Biológicas');
DECLARE @idFacEco INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Ciencias Económicas y Empresariales');
DECLARE @idFacDer INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Derecho y Ciencia Política');
DECLARE @idFacHum INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Humanidades y Lenguas Modernas');
DECLARE @idFacPsi INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Psicología');

-- 2. Lector (7 filas: 5 Alumnos + 2 Docentes)
IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234561')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '71234561', 'Carlos Alberto', 'Mendoza', 'Quispe', '202210101@urp.edu.pe', '987654321', 'Av. Benavides 5440, Santiago de Surco', 'Alumno', 'Activo', @idFacIng);
IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234562')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '71234562', 'Lucía Fernanda', 'Rojas', 'Salazar', '202310202@urp.edu.pe', '987654322', 'Jr. Las Palmeras 210, Miraflores', 'Alumno', 'Activo', @idFacMed);
IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234563')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '71234563', 'Mateo Andrés', 'Paredes', 'Vega', '202110303@urp.edu.pe', '987654323', 'Calle Los Pinos 145, San Borja', 'Alumno', 'Suspendido', @idFacArq);
IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234564')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '71234564', 'Valeria Sofía', 'Huamán', 'Torres', '202410404@urp.edu.pe', '987654324', 'Av. Javier Prado 1200, La Molina', 'Alumno', 'Activo', @idFacEco);
IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234565')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '71234565', 'Diego Alonso', 'Castillo', 'Morales', '202010505@urp.edu.pe', '987654325', 'Jr. Ayacucho 340, Barranco', 'Alumno', 'Activo', @idFacDer);
IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '40123456')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '40123456', 'Elena Beatriz', 'Campos', 'Navarro', 'elena.campos@urp.edu.pe', '999111222', 'Av. Caminos del Inca 890, Surco', 'Docente', 'Activo', @idFacIng);
IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '40123457')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '40123457', 'Ricardo Javier', 'Salgado', 'Benítez', 'ricardo.salgado@urp.edu.pe', '999111333', 'Calle Monte Rosa 230, Surco', 'Docente', 'Activo', @idFacPsi);

DECLARE @idLectorAlu1 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234561');
DECLARE @idLectorAlu2 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234562');
DECLARE @idLectorAlu3 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234563');
DECLARE @idLectorAlu4 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234564');
DECLARE @idLectorAlu5 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234565');
DECLARE @idLectorDoc1 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '40123456');
DECLARE @idLectorDoc2 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '40123457');

-- 3. Alumno (5 filas)
IF NOT EXISTS (SELECT 1 FROM Alumno WHERE id_lector = @idLectorAlu1) INSERT INTO Alumno (id_lector, codigo_alumno, ciclo) VALUES (@idLectorAlu1, '202210101', 6);
IF NOT EXISTS (SELECT 1 FROM Alumno WHERE id_lector = @idLectorAlu2) INSERT INTO Alumno (id_lector, codigo_alumno, ciclo) VALUES (@idLectorAlu2, '202310202', 4);
IF NOT EXISTS (SELECT 1 FROM Alumno WHERE id_lector = @idLectorAlu3) INSERT INTO Alumno (id_lector, codigo_alumno, ciclo) VALUES (@idLectorAlu3, '202110303', 8);
IF NOT EXISTS (SELECT 1 FROM Alumno WHERE id_lector = @idLectorAlu4) INSERT INTO Alumno (id_lector, codigo_alumno, ciclo) VALUES (@idLectorAlu4, '202410404', 2);
IF NOT EXISTS (SELECT 1 FROM Alumno WHERE id_lector = @idLectorAlu5) INSERT INTO Alumno (id_lector, codigo_alumno, ciclo) VALUES (@idLectorAlu5, '202010505', 10);

-- 4. Docente (2 filas)
IF NOT EXISTS (SELECT 1 FROM Docente WHERE id_lector = @idLectorDoc1) INSERT INTO Docente (id_lector, categoria_docente) VALUES (@idLectorDoc1, 'Principal');
IF NOT EXISTS (SELECT 1 FROM Docente WHERE id_lector = @idLectorDoc2) INSERT INTO Docente (id_lector, categoria_docente) VALUES (@idLectorDoc2, 'Titular');

-- 5. Editorial (7 filas)
IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'Pearson Educación') INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('Pearson Educación', 'México');
IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'McGraw-Hill') INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('McGraw-Hill', 'Estados Unidos');
IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'Editorial Médica Panamericana') INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('Editorial Médica Panamericana', 'España');
IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'Elsevier') INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('Elsevier', 'Países Bajos');
IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'Editorial Grijley') INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('Editorial Grijley', 'Perú');
IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'Fondo Editorial URP') INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('Fondo Editorial URP', 'Perú');
IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'Editorial Gustavo Gili') INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('Editorial Gustavo Gili', 'España');

DECLARE @idEdPearson INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'Pearson Educación');
DECLARE @idEdMcGraw INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'McGraw-Hill');
DECLARE @idEdPanam INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'Editorial Médica Panamericana');
DECLARE @idEdElsevier INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'Elsevier');
DECLARE @idEdGrijley INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'Editorial Grijley');
DECLARE @idEdUrp INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'Fondo Editorial URP');
DECLARE @idEdGili INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'Editorial Gustavo Gili');

-- 6. Autor (33 autores reales)
DECLARE @autores TABLE (nombre VARCHAR(200));
INSERT INTO @autores (nombre) VALUES
('Ramez Elmasri'),('Shamkant B. Navathe'),('Robert C. Martin'),('Erich Gamma'),('Richard Helm'),
('Henri Rouvière'),('Arthur C. Guyton'),('Horacio Argente'),('Bertram G. Katzung'),
('Francis D. K. Ching'),('Ernst Neufert'),('Kevin Lynch'),('Heino Engel'),
('Neil A. Campbell'),('Bruce Alberts'),('Horst Erich König'),('Michael Begon'),
('N. Gregory Mankiw'),('Philip Kotler'),('Stephen A. Ross'),('Fred R. David'),
('Aníbal Torres Vásquez'),('Víctor García Toma'),('Raúl Peña Cabrera'),('Enrique Véscovi'),
('Ferdinand de Saussure'),('Valentín García Yebra'),('Amparo Hurtado Albir'),('Martín de Riquer'),
('Charles G. Morris'),('American Psychiatric Association'),('Bryan Kolb'),('Duane P. Schultz');

INSERT INTO Autor (nombre_autor)
SELECT a.nombre FROM @autores a
WHERE NOT EXISTS (SELECT 1 FROM Autor ex WHERE ex.nombre_autor = a.nombre);

-- 7. Libro (32 libros: 4 por cada una de las 8 facultades)
DECLARE @libros TABLE (titulo VARCHAR(200));
INSERT INTO @libros (titulo) VALUES
-- Ingeniería (4)
('Fundamentos de Sistemas de Bases de Datos'),('Código Limpio (Clean Code)'),('Patrones de Diseño (Design Patterns)'),('Arquitectura Limpia (Clean Architecture)'),
-- Medicina Humana (4)
('Anatomía Humana'),('Tratado de Fisiología Médica'),('Semiología Médica'),('Farmacología Básica y Clínica'),
-- Arquitectura (4)
('Arquitectura: Forma, Espacio y Orden'),('Arte de Proyectar en Arquitectura'),('La Imagen de la Ciudad'),('Sistemas Estructurales'),
-- Ciencias Biológicas (4)
('Biología'),('Biología Molecular de la Célula'),('Anatomía de los Animales Domésticos'),('Ecología: Individuos, Poblaciones y Comunidades'),
-- Ciencias Económicas (4)
('Principios de Economía'),('Dirección de Marketing'),('Finanzas Corporativas'),('Administración Estratégica'),
-- Derecho (4)
('Tratado de Derecho Civil'),('Derecho Constitucional General'),('Manual de Derecho Penal'),('Teoría General del Proceso'),
-- Humanidades (4)
('Curso de Lingüística General'),('Teoría y Práctica de la Traducción'),('Manual de Traducción Especializada'),('Historia Universal de la Literatura'),
-- Psicología (4)
('Introducción a la Psicología'),('Manual Diagnóstico DSM-5-TR'),('Neuropsicología Humana'),('Teorías de la Personalidad');

INSERT INTO Libro (titulo)
SELECT l.titulo FROM @libros l
WHERE NOT EXISTS (SELECT 1 FROM Libro ex WHERE ex.titulo = l.titulo);

-- 8. Libro_Autor
DECLARE @la TABLE (titulo VARCHAR(200), autor VARCHAR(200));
INSERT INTO @la VALUES
('Fundamentos de Sistemas de Bases de Datos','Ramez Elmasri'),('Fundamentos de Sistemas de Bases de Datos','Shamkant B. Navathe'),
('Código Limpio (Clean Code)','Robert C. Martin'),
('Patrones de Diseño (Design Patterns)','Erich Gamma'),('Patrones de Diseño (Design Patterns)','Richard Helm'),
('Arquitectura Limpia (Clean Architecture)','Robert C. Martin'),
('Anatomía Humana','Henri Rouvière'),('Tratado de Fisiología Médica','Arthur C. Guyton'),
('Semiología Médica','Horacio Argente'),('Farmacología Básica y Clínica','Bertram G. Katzung'),
('Arquitectura: Forma, Espacio y Orden','Francis D. K. Ching'),('Arte de Proyectar en Arquitectura','Ernst Neufert'),
('La Imagen de la Ciudad','Kevin Lynch'),('Sistemas Estructurales','Heino Engel'),
('Biología','Neil A. Campbell'),('Biología Molecular de la Célula','Bruce Alberts'),
('Anatomía de los Animales Domésticos','Horst Erich König'),('Ecología: Individuos, Poblaciones y Comunidades','Michael Begon'),
('Principios de Economía','N. Gregory Mankiw'),('Dirección de Marketing','Philip Kotler'),
('Finanzas Corporativas','Stephen A. Ross'),('Administración Estratégica','Fred R. David'),
('Tratado de Derecho Civil','Aníbal Torres Vásquez'),('Derecho Constitucional General','Víctor García Toma'),
('Manual de Derecho Penal','Raúl Peña Cabrera'),('Teoría General del Proceso','Enrique Véscovi'),
('Curso de Lingüística General','Ferdinand de Saussure'),('Teoría y Práctica de la Traducción','Valentín García Yebra'),
('Manual de Traducción Especializada','Amparo Hurtado Albir'),('Historia Universal de la Literatura','Martín de Riquer'),
('Introducción a la Psicología','Charles G. Morris'),('Manual Diagnóstico DSM-5-TR','American Psychiatric Association'),
('Neuropsicología Humana','Bryan Kolb'),('Teorías de la Personalidad','Duane P. Schultz');

INSERT INTO Libro_Autor (id_libro, id_autor)
SELECT l.id_libro, a.id_autor
FROM @la m
JOIN Libro l ON l.titulo = m.titulo
JOIN Autor a ON a.nombre_autor = m.autor
WHERE NOT EXISTS (SELECT 1 FROM Libro_Autor ex WHERE ex.id_libro = l.id_libro AND ex.id_autor = a.id_autor);

-- 9. Edicion (32 ediciones)
DECLARE @eds TABLE (isbn VARCHAR(20), num SMALLINT, anio SMALLINT, idEd INT, titulo VARCHAR(200));
INSERT INTO @eds VALUES
('9788478290857',5,2007,@idEdPearson,'Fundamentos de Sistemas de Bases de Datos'),
('9780132350884',1,2008,@idEdPearson,'Código Limpio (Clean Code)'),
('9788478290598',1,2002,@idEdPearson,'Patrones de Diseño (Design Patterns)'),
('9788441540040',1,2018,@idEdPearson,'Arquitectura Limpia (Clean Architecture)'),
('9788498357622',11,2005,@idEdPanam,'Anatomía Humana'),
('9788491130246',13,2016,@idEdElsevier,'Tratado de Fisiología Médica'),
('9789500604512',2,2013,@idEdPanam,'Semiología Médica'),
('9786071514554',14,2019,@idEdMcGraw,'Farmacología Básica y Clínica'),
('9788425228698',4,2015,@idEdMcGraw,'Arquitectura: Forma, Espacio y Orden'),
('9788425224720',16,2013,@idEdGili,'Arte de Proyectar en Arquitectura'),
('9788425228209',1,2015,@idEdGili,'La Imagen de la Ciudad'),
('9788425218637',1,2001,@idEdGili,'Sistemas Estructurales'),
('9788478290987',9,2011,@idEdPearson,'Biología'),
('9788428216388',6,2016,@idEdElsevier,'Biología Molecular de la Célula'),
('9788498354683',2,2012,@idEdPanam,'Anatomía de los Animales Domésticos'),
('9788428211529',3,1999,@idEdElsevier,'Ecología: Individuos, Poblaciones y Comunidades'),
('9786075262154',7,2017,@idEdMcGraw,'Principios de Economía'),
('9786073238458',15,2016,@idEdPearson,'Dirección de Marketing'),
('9786071513762',11,2018,@idEdMcGraw,'Finanzas Corporativas'),
('9786073240222',15,2017,@idEdPearson,'Administración Estratégica'),
('9786124371028',2,2019,@idEdGrijley,'Tratado de Derecho Civil'),
('9786124034121',1,2017,@idEdGrijley,'Derecho Constitucional General'),
('9786124371158',3,2018,@idEdGrijley,'Manual de Derecho Penal'),
('9786124419096',2,2016,@idEdUrp,'Teoría General del Proceso'),
('9786124419010',1,2018,@idEdUrp,'Curso de Lingüística General'),
('9788424918460',3,2010,@idEdUrp,'Teoría y Práctica de la Traducción'),
('9788434481121',2,2014,@idEdUrp,'Manual de Traducción Especializada'),
('9788424936402',10,2012,@idEdUrp,'Historia Universal de la Literatura'),
('9786073221375',13,2014,@idEdPearson,'Introducción a la Psicología'),
('9788491108153',5,2022,@idEdPanam,'Manual Diagnóstico DSM-5-TR'),
('9788491101338',7,2017,@idEdPanam,'Neuropsicología Humana'),
('9786075260051',10,2015,@idEdMcGraw,'Teorías de la Personalidad');

INSERT INTO Edicion (isbn, numero_edicion, anio_publicacion, id_editorial, id_libro)
SELECT e.isbn, e.num, e.anio, e.idEd, l.id_libro
FROM @eds e
JOIN Libro l ON l.titulo = e.titulo
WHERE NOT EXISTS (SELECT 1 FROM Edicion ex WHERE ex.isbn = e.isbn);

-- 10. Ejemplar (40 copias repartidas en las 8 facultades: mínimo 4 libros distintos por facultad)
DECLARE @ejs TABLE (isbn VARCHAR(20), copia SMALLINT, estado VARCHAR(20), idFac INT);
INSERT INTO @ejs VALUES
('9788478290857',1,'Bueno',@idFacIng),('9788478290857',2,'Regular',@idFacIng),
('9780132350884',1,'Bueno',@idFacIng),('9780132350884',2,'En Reparacion',@idFacIng),
('9788478290598',1,'Bueno',@idFacIng),('9788441540040',1,'Bueno',@idFacIng),
('9788498357622',1,'Bueno',@idFacMed),('9788491130246',1,'Bueno',@idFacMed),('9788491130246',2,'Regular',@idFacMed),
('9789500604512',1,'Bueno',@idFacMed),('9786071514554',1,'En Reparacion',@idFacMed),
('9788425228698',1,'Bueno',@idFacArq),('9788425228698',2,'Bueno',@idFacArq),
('9788425224720',1,'Bueno',@idFacArq),('9788425228209',1,'Regular',@idFacArq),('9788425218637',1,'Bueno',@idFacArq),
('9788478290987',1,'Bueno',@idFacBio),('9788478290987',2,'Dañado',@idFacBio),
('9788428216388',1,'Bueno',@idFacBio),('9788498354683',1,'Bueno',@idFacBio),('9788428211529',1,'Regular',@idFacBio),
('9786075262154',1,'Bueno',@idFacEco),('9786075262154',2,'Regular',@idFacEco),
('9786073238458',1,'Bueno',@idFacEco),('9786071513762',1,'Bueno',@idFacEco),('9786073240222',1,'Bueno',@idFacEco),
('9786124371028',1,'Bueno',@idFacDer),('9786124371028',2,'En Reparacion',@idFacDer),
('9786124034121',1,'Bueno',@idFacDer),('9786124371158',1,'Bueno',@idFacDer),('9786124419096',1,'Bueno',@idFacDer),
('9786124419010',1,'Bueno',@idFacHum),('9788424918460',1,'Bueno',@idFacHum),
('9788434481121',1,'Bueno',@idFacHum),('9788424936402',1,'Regular',@idFacHum),
('9786073221375',1,'Bueno',@idFacPsi),('9786073221375',2,'Regular',@idFacPsi),
('9788491108153',1,'Bueno',@idFacPsi),('9788491101338',1,'Bueno',@idFacPsi),('9786075260051',1,'Bueno',@idFacPsi);

INSERT INTO Ejemplar (isbn, numero_copia, tipo_estado_fisico, id_facultad)
SELECT ej.isbn, ej.copia, ej.estado, ej.idFac
FROM @ejs ej
WHERE NOT EXISTS (SELECT 1 FROM Ejemplar ex WHERE ex.isbn = ej.isbn AND ex.numero_copia = ej.copia);

-- 11. Prestamo (3 filas: sin cambios)
IF NOT EXISTS (SELECT 1 FROM Prestamo WHERE id_lector = @idLectorAlu1 AND isbn = '9788478290857' AND numero_copia = 1)
    INSERT INTO Prestamo (fecha_prestamo, fecha_vencimiento, fecha_devolucion_real, tipo_prestamo, id_lector, isbn, numero_copia)
    VALUES ('2026-11-01 10:00:00', '2026-11-04 21:00:00', '2026-11-06 15:00:00', 'Domicilio', @idLectorAlu1, '9788478290857', 1);

IF NOT EXISTS (SELECT 1 FROM Prestamo WHERE id_lector = @idLectorAlu2 AND isbn = '9788498357622' AND numero_copia = 1)
    INSERT INTO Prestamo (fecha_prestamo, fecha_vencimiento, fecha_devolucion_real, tipo_prestamo, id_lector, isbn, numero_copia)
    VALUES ('2026-11-24 11:00:00', '2026-11-27 21:00:00', NULL, 'Domicilio', @idLectorAlu2, '9788498357622', 1);

IF NOT EXISTS (SELECT 1 FROM Prestamo WHERE id_lector = @idLectorAlu3 AND isbn = '9788425228698' AND numero_copia = 1)
    INSERT INTO Prestamo (fecha_prestamo, fecha_vencimiento, fecha_devolucion_real, tipo_prestamo, id_lector, isbn, numero_copia)
    VALUES ('2026-11-10 09:30:00', '2026-11-13 21:00:00', NULL, 'Domicilio', @idLectorAlu3, '9788425228698', 1);

DECLARE @idPrestamoPagado INT = (SELECT TOP 1 id_prestamo FROM Prestamo WHERE id_lector = @idLectorAlu1 AND isbn = '9788478290857' AND numero_copia = 1);
DECLARE @idPrestamoVencido INT = (SELECT TOP 1 id_prestamo FROM Prestamo WHERE id_lector = @idLectorAlu3 AND isbn = '9788425228698' AND numero_copia = 1);

-- 12. Deuda (2 filas: sin cambios)
IF NOT EXISTS (SELECT 1 FROM Deuda WHERE id_prestamo = @idPrestamoPagado)
    INSERT INTO Deuda (tarifa_diaria, fecha_fin_suspension, estado_deuda, id_prestamo)
    VALUES (5.00, '2026-11-09 21:00:00', 'Pagada', @idPrestamoPagado);

IF NOT EXISTS (SELECT 1 FROM Deuda WHERE id_prestamo = @idPrestamoVencido)
    INSERT INTO Deuda (tarifa_diaria, fecha_fin_suspension, estado_deuda, id_prestamo)
    VALUES (5.00, NULL, 'Pendiente', @idPrestamoVencido);

DECLARE @idDeudaPagada INT = (SELECT id_deuda FROM Deuda WHERE id_prestamo = @idPrestamoPagado);

-- 13. Pago (1 fila: sin cambios)
IF NOT EXISTS (SELECT 1 FROM Pago WHERE id_deuda = @idDeudaPagada)
    INSERT INTO Pago (numero_recibo, fecha_pago, monto_pagado, id_deuda)
    VALUES ('REC-2026-0001', '2026-11-06 15:10:00', 10.00, @idDeudaPagada);
