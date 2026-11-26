-- Datos semilla idempotentes para pruebas de Biblioteca URP (13 tablas)
-- Ejecutar después de ModeloFísico.sql

-- 1. Facultad (3 filas)
IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Ingeniería')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Ingeniería');

IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Medicina Humana')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Medicina Humana');

IF NOT EXISTS (SELECT 1 FROM Facultad WHERE nombre_facultad = 'Facultad de Arquitectura y Urbanismo')
    INSERT INTO Facultad (nombre_facultad) VALUES ('Facultad de Arquitectura y Urbanismo');

DECLARE @idFacIng INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Ingeniería');
DECLARE @idFacMed INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Medicina Humana');
DECLARE @idFacArq INT = (SELECT id_facultad FROM Facultad WHERE nombre_facultad = 'Facultad de Arquitectura y Urbanismo');

-- 2. Lector (4 filas: 3 Alumnos + 1 Docente)
IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234561')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '71234561', 'Carlos Alberto', 'Mendoza', 'Quispe', '202210101@urp.edu.pe', '987654321', 'Av. Benavides 5440, Santiago de Surco', 'Alumno', 'Activo', @idFacIng);

IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234562')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '71234562', 'Lucía Fernanda', 'Rojas', 'Salazar', '202310202@urp.edu.pe', '987654322', 'Jr. Las Palmeras 210, Miraflores', 'Alumno', 'Activo', @idFacMed);

IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234563')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '71234563', 'Mateo Andrés', 'Paredes', 'Vega', '202110303@urp.edu.pe', '987654323', 'Calle Los Pinos 145, San Borja', 'Alumno', 'Suspendido', @idFacArq);

IF NOT EXISTS (SELECT 1 FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '40123456')
    INSERT INTO Lector (tipo_doc, numero_doc, nombres, apellido_paterno, apellido_materno, correo_institucional, telefono, direccion, tipo_lector, estado_lector, id_facultad)
    VALUES ('DNI', '40123456', 'Elena Beatriz', 'Campos', 'Navarro', 'elena.campos@urp.edu.pe', '999111222', 'Av. Caminos del Inca 890, Surco', 'Docente', 'Activo', @idFacIng);

DECLARE @idLectorAlu1 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234561');
DECLARE @idLectorAlu2 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234562');
DECLARE @idLectorAlu3 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '71234563');
DECLARE @idLectorDoc1 INT = (SELECT id_lector FROM Lector WHERE tipo_doc = 'DNI' AND numero_doc = '40123456');

-- 3. Alumno (3 filas)
IF NOT EXISTS (SELECT 1 FROM Alumno WHERE id_lector = @idLectorAlu1)
    INSERT INTO Alumno (id_lector, codigo_alumno, ciclo) VALUES (@idLectorAlu1, '202210101', 6);

IF NOT EXISTS (SELECT 1 FROM Alumno WHERE id_lector = @idLectorAlu2)
    INSERT INTO Alumno (id_lector, codigo_alumno, ciclo) VALUES (@idLectorAlu2, '202310202', 4);

IF NOT EXISTS (SELECT 1 FROM Alumno WHERE id_lector = @idLectorAlu3)
    INSERT INTO Alumno (id_lector, codigo_alumno, ciclo) VALUES (@idLectorAlu3, '202110303', 8);

-- 4. Docente (1 fila)
IF NOT EXISTS (SELECT 1 FROM Docente WHERE id_lector = @idLectorDoc1)
    INSERT INTO Docente (id_lector, categoria_docente) VALUES (@idLectorDoc1, 'Principal');

-- 5. Editorial (3 filas)
IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'Pearson Educación')
    INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('Pearson Educación', 'México');

IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'McGraw-Hill')
    INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('McGraw-Hill', 'Estados Unidos');

IF NOT EXISTS (SELECT 1 FROM Editorial WHERE nombre_editorial = 'Editorial Médica Panamericana')
    INSERT INTO Editorial (nombre_editorial, pais_origen) VALUES ('Editorial Médica Panamericana', 'España');

DECLARE @idEdPearson INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'Pearson Educación');
DECLARE @idEdMcGraw INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'McGraw-Hill');
DECLARE @idEdPanam INT = (SELECT id_editorial FROM Editorial WHERE nombre_editorial = 'Editorial Médica Panamericana');

-- 6. Libro (4 filas)
IF NOT EXISTS (SELECT 1 FROM Libro WHERE titulo = 'Fundamentos de Sistemas de Bases de Datos')
    INSERT INTO Libro (titulo) VALUES ('Fundamentos de Sistemas de Bases de Datos');

IF NOT EXISTS (SELECT 1 FROM Libro WHERE titulo = 'Código Limpio (Clean Code)')
    INSERT INTO Libro (titulo) VALUES ('Código Limpio (Clean Code)');

IF NOT EXISTS (SELECT 1 FROM Libro WHERE titulo = 'Anatomía Humana')
    INSERT INTO Libro (titulo) VALUES ('Anatomía Humana');

IF NOT EXISTS (SELECT 1 FROM Libro WHERE titulo = 'Arquitectura: Forma, Espacio y Orden')
    INSERT INTO Libro (titulo) VALUES ('Arquitectura: Forma, Espacio y Orden');

DECLARE @idLibBD INT = (SELECT id_libro FROM Libro WHERE titulo = 'Fundamentos de Sistemas de Bases de Datos');
DECLARE @idLibClean INT = (SELECT id_libro FROM Libro WHERE titulo = 'Código Limpio (Clean Code)');
DECLARE @idLibAnat INT = (SELECT id_libro FROM Libro WHERE titulo = 'Anatomía Humana');
DECLARE @idLibArq INT = (SELECT id_libro FROM Libro WHERE titulo = 'Arquitectura: Forma, Espacio y Orden');

-- 7. Autor (4 filas)
IF NOT EXISTS (SELECT 1 FROM Autor WHERE nombre_autor = 'Ramez Elmasri')
    INSERT INTO Autor (nombre_autor) VALUES ('Ramez Elmasri');

IF NOT EXISTS (SELECT 1 FROM Autor WHERE nombre_autor = 'Shamkant B. Navathe')
    INSERT INTO Autor (nombre_autor) VALUES ('Shamkant B. Navathe');

IF NOT EXISTS (SELECT 1 FROM Autor WHERE nombre_autor = 'Robert C. Martin')
    INSERT INTO Autor (nombre_autor) VALUES ('Robert C. Martin');

IF NOT EXISTS (SELECT 1 FROM Autor WHERE nombre_autor = 'Francis D. K. Ching')
    INSERT INTO Autor (nombre_autor) VALUES ('Francis D. K. Ching');

DECLARE @idAutElmasri INT = (SELECT id_autor FROM Autor WHERE nombre_autor = 'Ramez Elmasri');
DECLARE @idAutNavathe INT = (SELECT id_autor FROM Autor WHERE nombre_autor = 'Shamkant B. Navathe');
DECLARE @idAutMartin INT = (SELECT id_autor FROM Autor WHERE nombre_autor = 'Robert C. Martin');
DECLARE @idAutChing INT = (SELECT id_autor FROM Autor WHERE nombre_autor = 'Francis D. K. Ching');

-- 8. Libro_Autor (5 filas: incluye coautoría en Bases de Datos)
IF NOT EXISTS (SELECT 1 FROM Libro_Autor WHERE id_libro = @idLibBD AND id_autor = @idAutElmasri)
    INSERT INTO Libro_Autor (id_libro, id_autor) VALUES (@idLibBD, @idAutElmasri);

IF NOT EXISTS (SELECT 1 FROM Libro_Autor WHERE id_libro = @idLibBD AND id_autor = @idAutNavathe)
    INSERT INTO Libro_Autor (id_libro, id_autor) VALUES (@idLibBD, @idAutNavathe);

IF NOT EXISTS (SELECT 1 FROM Libro_Autor WHERE id_libro = @idLibClean AND id_autor = @idAutMartin)
    INSERT INTO Libro_Autor (id_libro, id_autor) VALUES (@idLibClean, @idAutMartin);

IF NOT EXISTS (SELECT 1 FROM Libro_Autor WHERE id_libro = @idLibAnat AND id_autor = @idAutElmasri)
    INSERT INTO Libro_Autor (id_libro, id_autor) VALUES (@idLibAnat, @idAutElmasri);

IF NOT EXISTS (SELECT 1 FROM Libro_Autor WHERE id_libro = @idLibArq AND id_autor = @idAutChing)
    INSERT INTO Libro_Autor (id_libro, id_autor) VALUES (@idLibArq, @idAutChing);

-- 9. Edicion (4 filas)
IF NOT EXISTS (SELECT 1 FROM Edicion WHERE isbn = '9788478290857')
    INSERT INTO Edicion (isbn, numero_edicion, anio_publicacion, id_editorial, id_libro)
    VALUES ('9788478290857', 5, 2007, @idEdPearson, @idLibBD);

IF NOT EXISTS (SELECT 1 FROM Edicion WHERE isbn = '9780132350884')
    INSERT INTO Edicion (isbn, numero_edicion, anio_publicacion, id_editorial, id_libro)
    VALUES ('9780132350884', 1, 2008, @idEdPearson, @idLibClean);

IF NOT EXISTS (SELECT 1 FROM Edicion WHERE isbn = '9788498357622')
    INSERT INTO Edicion (isbn, numero_edicion, anio_publicacion, id_editorial, id_libro)
    VALUES ('9788498357622', 4, 2014, @idEdPanam, @idLibAnat);

IF NOT EXISTS (SELECT 1 FROM Edicion WHERE isbn = '9788425228698')
    INSERT INTO Edicion (isbn, numero_edicion, anio_publicacion, id_editorial, id_libro)
    VALUES ('9788425228698', 4, 2015, @idEdMcGraw, @idLibArq);

-- 10. Ejemplar (6 filas)
IF NOT EXISTS (SELECT 1 FROM Ejemplar WHERE isbn = '9788478290857' AND numero_copia = 1)
    INSERT INTO Ejemplar (isbn, numero_copia, tipo_estado_fisico, id_facultad) VALUES ('9788478290857', 1, 'Bueno', @idFacIng);

IF NOT EXISTS (SELECT 1 FROM Ejemplar WHERE isbn = '9788478290857' AND numero_copia = 2)
    INSERT INTO Ejemplar (isbn, numero_copia, tipo_estado_fisico, id_facultad) VALUES ('9788478290857', 2, 'Regular', @idFacIng);

IF NOT EXISTS (SELECT 1 FROM Ejemplar WHERE isbn = '9780132350884' AND numero_copia = 1)
    INSERT INTO Ejemplar (isbn, numero_copia, tipo_estado_fisico, id_facultad) VALUES ('9780132350884', 1, 'Bueno', @idFacIng);

IF NOT EXISTS (SELECT 1 FROM Ejemplar WHERE isbn = '9780132350884' AND numero_copia = 2)
    INSERT INTO Ejemplar (isbn, numero_copia, tipo_estado_fisico, id_facultad) VALUES ('9780132350884', 2, 'En Reparacion', @idFacIng);

IF NOT EXISTS (SELECT 1 FROM Ejemplar WHERE isbn = '9788498357622' AND numero_copia = 1)
    INSERT INTO Ejemplar (isbn, numero_copia, tipo_estado_fisico, id_facultad) VALUES ('9788498357622', 1, 'Bueno', @idFacMed);

IF NOT EXISTS (SELECT 1 FROM Ejemplar WHERE isbn = '9788425228698' AND numero_copia = 1)
    INSERT INTO Ejemplar (isbn, numero_copia, tipo_estado_fisico, id_facultad) VALUES ('9788425228698', 1, 'Bueno', @idFacArq);

-- 11. Prestamo (3 filas: 1 devuelto tarde ya pagado, 1 activo vigente, 1 vencido sin devolver)
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

-- 12. Deuda (2 filas: 1 Pagada con fecha_fin_suspension pasada, 1 Pendiente con fecha_fin_suspension NULL)
IF NOT EXISTS (SELECT 1 FROM Deuda WHERE id_prestamo = @idPrestamoPagado)
    INSERT INTO Deuda (tarifa_diaria, fecha_fin_suspension, estado_deuda, id_prestamo)
    VALUES (5.00, '2026-11-09 21:00:00', 'Pagada', @idPrestamoPagado);

IF NOT EXISTS (SELECT 1 FROM Deuda WHERE id_prestamo = @idPrestamoVencido)
    INSERT INTO Deuda (tarifa_diaria, fecha_fin_suspension, estado_deuda, id_prestamo)
    VALUES (5.00, NULL, 'Pendiente', @idPrestamoVencido);

DECLARE @idDeudaPagada INT = (SELECT id_deuda FROM Deuda WHERE id_prestamo = @idPrestamoPagado);

-- 13. Pago (1 fila cancelando la deuda Pagada: 2 días de retraso * S/ 5.00 = S/ 10.00)
IF NOT EXISTS (SELECT 1 FROM Pago WHERE id_deuda = @idDeudaPagada)
    INSERT INTO Pago (numero_recibo, fecha_pago, monto_pagado, id_deuda)
    VALUES ('REC-2026-0001', '2026-11-06 15:10:00', 10.00, @idDeudaPagada);
