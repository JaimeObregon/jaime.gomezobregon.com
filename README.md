# `jaime.gomezobregon.com`

He aquí el código fuente de mi blog personal. Lo inicié en el verano de 2006 como un sitio basado en WordPress y ahora, en 2020, lo he reconstruido con exquisito [prurito](https://dle.rae.es/prurito) y énfasis en el minimalismo y la eficacia.

# Modo de empleo

Los contenidos del blog están todos en el directorio [`/posts`](/httpdocs/posts). Para añadir un artículo...

1. Crea un subdirectorio en `/posts` y sitúa el contenido del artículo dentro: un fichero `index.html` con el contenido principal y cualquier otro recurso que el artículo necesite cargar.

2. Añade el artículo recién creado a [`index.js`](/httpdocs/posts/index.js). La portada del blog mostrará el índice de artículos en el mismo orden en que los consignes en ese fichero.

# Desplegue

En [`.github/workflows/main.yml`](/.github/workflows/main.yml) he incorporado un *script* que, a partir de mi configuración personal en Github, despliega todo el sitio en mi servidor web con cada *push* a `master`.

# Estructura mínima de un artículo

Cada artículo tiene que tener, como mínimo, un fichero `index.html` con el contenido principal. No obstante ahí también puedes cargar imágenes, recursos multimedia, hojas de estilos y cualquier otra cosa que el artículo requiera.

Es requisito que el fichero `index.html` de cada artículo tenga un elemento `<h1>` con el título, que así puede ser diferente del título que hayas consignado en [`index.js`](/httpdocs/posts/index.js).

# Tecnología

Este proyecto utiliza exclusivamente estándares web: HTML5, CSS3 y ES6 (JavaScript). No hay ningún lenguaje de *scripting* en el lado del servidor, ni se requiere de una base de datos.

Es necesario un servidor web capaz de interpretar las sencillas reglas de reescritura del fichero [`.htaccess`](/httpdocs/.htaccess). Por ejemplo, Apache.

# Licencia

Los contenidos de mi blog están publicados bajo licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es): puedes reutilizarlos citando que soy su autor y enlazando a la versión original.

El código fuente de este blog [lo he publicado en Github](github.com/jaimeobregon/jaime.gomezobregon.com) y lo libero bajo licencia [AGPL 3.0](/LICENSE). Puedes reutilizarlo atendiendo lo que establece la licencia.
