# Proyecto de Base de Datos - Biblioteca URP

Este repositorio contiene los archivos y documentación para nuestro proyecto universitario de bases de datos, donde el foco principal es el desarrollo y entendimiento de las bases de datos relacionales, cumpliendo con la Tercera Forma Normal (3NF), propiedades ACID, transacciones y procedimientos almacenados.

Adicionalmente, se está incorporando un cliente web desacoplado y una API REST para consumir y demostrar el uso de la base de datos en un entorno real.

## Stack

* **Base de Datos:** Azure SQL Database / Microsoft SQL Server
* **Backend:** C# .NET 10 (ASP.NET Core Web API en N-Capas)
* **Acceso a Datos:** Entity Framework Core (ejecución de Stored Procedures y Vistas)
* **Documentación de API:** Scalar (`Scalar.AspNetCore`)
* **Frontend:** Angular (Cliente Web SPA desacoplado)

## Documentación

Toda la documentación técnica del diseño de la base de datos se encuentra organizada en la carpeta [`docs/`](docs/):

* **[Modelo Conceptual (`docs/ModeloConceptual.drawio`)](docs/ModeloConceptual.drawio):** Diagrama Entidad-Relación (MER) con notación de Peter Chen, identificando entidades fuertes, débiles, atributos compuestos y relaciones.
* **[Modelo Relacional (`docs/ModeloRelacional.md`)](docs/ModeloRelacional.md):** Especificación formal de las 13 relaciones normalizadas en 3NF, tabla de cardinalidades, reglas de negocio del sistema y dependencias funcionales.
* **[Modelo Físico (`docs/ModeloFísico.sql`)](docs/ModeloFísico.sql):** Script DDL con la creación de tablas, restricciones de integridad (`PK`, `FK`, `CHECK`, `UNIQUE`), índices y procedimientos almacenados.
