# **Modelo Relacional**

Este modelo relacional representa el sistema de **bibliotecas de una universidad**(En este caso URP). Organiza en tablas a los usuarios, los libros con sus ejemplares, y los préstamos, y multas. 

## **RELACIONES(TABLAS)**

**FACULTAD** (***id\_facultad [PK]***, nombre\_facultad)

**LECTOR** (***id\_lector [PK]***, tipo\_doc, numero\_doc, nombres, apellido\_paterno, apellido\_materno, correo\_institucional, telefono, direccion, tipo\_lector, estado\_lector, *id\_facultad \[FK\]*)

**ALUMNO** (***id\_lector \[PK][FK\]***, codigo\_alumno, ciclo)

**DOCENTE** (***id\_lector \[PK][FK\]***, categoria\_docente)

**EDITORIAL** (***id\_editorial [PK]***, nombre\_editorial, pais\_origen)

**LIBRO** (***id\_libro [PK]***, titulo)

**LIBRO\_AUTOR** (***id\_libro \[PK][FK\], id\_autor \[PK][FK\]***)

**AUTOR** (***id\_autor [PK]***, nombre\_autor)

**EDICION** (***isbn [PK]***, numero\_edicion, anio\_publicacion, *id\_editorial \[FK\], id\_libro \[FK\]*)

**EJEMPLAR** (***isbn [PK][FK\], numero\_copia [PK]***, tipo\_estado\_fisico, *id\_facultad \[FK\]*)

**PRESTAMO** (***id\_prestamo [PK]***, fecha\_prestamo, fecha\_vencimiento, fecha\_devolucion\_real, tipo\_prestamo, *id\_lector \[FK\], isbn \[FK\], numero\_copia \[FK\]*)

**DEUDA** (***id\_deuda [PK]***, tarifa\_diaria, fecha\_fin\_suspension, estado\_deuda, *id\_prestamo \[FK\]*)

**PAGO** (***id\_pago [PK]***, numero\_recibo, fecha\_pago, monto\_pagado, *id\_deuda \[FK\])*

Al generar Libro\_Autor para resolver el atributo multivaluado de muchos autores en un libro se rompe otra regla al tener que repetir el mismo autor múltiples veces, porque un mismo autor pudo haber escribo varios libros, entonces se crea la tabla autor separada de Libro\_Autor para evitar el muchos a muchos, usando a Libro\_Autor como tabla intermedia.

## **CARDINALIDADES**

| Relación | Entre | Cardinalidad |
| :---- | :---- | :---- |
| Tiene | LIBRO – EDICION | 1 : N |
| Escribe | AUTOR \- LIBRO\_AUTOR | 1 : N |
| Pertenece | LIBRO \- LIBRO\_AUTOR | 1 : N |
| Publica | EDITORIAL – EDICION | 1 : N  |
| Tiene | EDICION – EJEMPLAR | 1 : N |
| Ubica | FACULTAD – EJEMPLAR | 1 : N |
| Tiene | FACULTAD – LECTOR | 1 : N |
| Solicita | LECTOR – PRESTAMO | 1 : N |
| Participa | EJEMPLAR – PRESTAMO | 1 : N  |
| Genera | PRESTAMO – DEUDA | 1 : 0..1 |
| Cancela | DEUDA – PAGO | 1 : 0..1 |

## **REGLAS PARA HACER LA BASE DE DATOS:**

Son las reglas que la base de datos siempre debe cumplir:

1. Las fechas de devolución no pueden ser anteriores al préstamo  
2. Un ejemplar no puede estar en dos préstamos activos a la vez.  
3. fecha\_vencimiento \> fecha\_prestamo (apuntando a la hora de cierre de la biblioteca del día correspondiente), y fecha\_devolucion\_real es nula mientras el libro no se devuelva.  
4. Una deuda nace apenas la fecha actual supere a la de vencimiento (con fecha\_fin\_suspension nula hasta que se devuelva el ejemplar). Su monto se calcula como días de retraso x tarifa\_diaria.  
5. Un lector con deuda pendiente queda suspendido hasta fecha\_fin\_suspension (la cual se cumple aunque pague antes, y se acumula si tiene múltiples deudas) y no puede pedir nuevos préstamos.  
6. Un lector es alumno o docente, no ambos.  
7. El monto\_pagado debe ser mayor que cero.  
8. Las deudas se pagan en un único pago íntegro (monto\_pagado = días de retraso x tarifa\_diaria) sin posibilidad de convertirlo en cuotas de pago.  
9. Un Ejemplar no depende de su ubicación, por eso la FK de FACULTAD en EJEMPLAR no es PK.  
10. Una edición no depende de su editorial, por eso la FK de EDITORIAL en EDICION no es PK.  
11. Una edición es identificada por su ISBN por estándar.  
12. Un ejemplar solo puede prestarse si su tipo\_estado\_fisico es BUENO o REGULAR. Si está marcado como DAÑADO o EN\_REPARACION, el sistema debe rechazar el préstamo.  
13. Un ALUMNO puede pedir prestado como máximo 3 ejemplares en préstamo activo simultáneo y un DOCENTE como máximo 5.  
14. Existen dos tipos de préstamo, SALA y DOMICILIO; los préstamos en sala cubren la jornada del mismo día hasta el cierre (sin mora por horas, solo si pasa al día siguiente) y los préstamos a DOMICILIO tienen un plazo por defecto de 3 días.  
15. Un lector con estado\_lector SUSPENDIDO o con alguna DEUDA pendiente no podrá hacer uso del servicio.  
16. Los días de suspensión se calculan con base en 3 días de suspensión, que va incrementando a partir del tercer día de retraso. Si se retrasa 1 o 2 días son 3 días de suspensión.  
17. Pasados los dos días de “gracia” el sistema va añadiendo días en función de factor doble por cada día adicional de retraso. Días de suspensión \= 3 \+ max(0, n días retraso \- 2 gracia) x 2\.

| Días retraso | Aplicando: Días de suspensión \= 3 \+ max(0, n días retraso \- 2 gracia) x 2 |
| :---- | :---- |
| 1 | 3 \+ max(0, \-1) x 2 \= 3 \+ (0 x 2\) \= 3 días |
| 2 | 3 \+ max(0, 0\) x 2 \= 3 \+ (0 x 2\) \= 3 días |
| 3 | 3 \+ max(0, 1\) x 2 \= 3 \+ (1 x 2\) \= 5 días |
| 4 | 3 \+ max(0, 2\) x 2 \= 3 \+ (2 x 2\) \= 7 días |
| 5 | 3 \+ max(0, 3\) x 2 \= 3 \+ (3 x 2\) \= 9 días |

    

