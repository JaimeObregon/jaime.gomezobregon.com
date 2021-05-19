# `jaime.gomezobregon.com`

He aquí el código fuente de mi blog personal. Lo inicié en el verano de 2006 como un sitio basado en WordPress y en 2020 lo reconstruí con exquisito [prurito](https://dle.rae.es/prurito) y énfasis en el minimalismo y la eficacia.

# Modo de empleo

Los contenidos del blog están todos en [`/posts`](/httpdocs/posts). Para añadir un artículo…:

1. Crea un subdirectorio en [`/posts`](/httpdocs/posts) y sitúa el contenido del artículo dentro: un fichero `index.html` con el contenido principal y cualquier otro recurso que el artículo necesite cargar.

2. Añade el artículo recién creado a [`index.json`](/httpdocs/posts/index.json). La portada del blog mostrará el índice de artículos en el mismo orden en que los consignes en ese fichero.

El fichero `index.json` es el *feed* del blog en formato [JSON Feed](https://jsonfeed.org). La mayoría de los sitios generan este *feed* a partir de los contenidos; aquí lo hacemos justo al revés.

# Despliegue

En [`.github/workflows/main.yml`](/.github/workflows/main.yml) he incorporado un *script* que, a partir de mi configuración personal en Github, despliega todo el sitio en mi servidor web con cada *push* a `master`.

# Estructura mínima de un artículo

Cada artículo ha de tener, como mínimo, un fichero `index.html` con el contenido principal. No obstante ahí también puedes cargar imágenes, recursos multimedia, hojas de estilos y cualquier otra cosa que el artículo requiera.

Es requisito que el fichero `index.html` de cada artículo tenga un elemento `<h1>` con el título, que así puede ser diferente del título que hayas consignado en [`index.json`](/httpdocs/posts/index.json).

Opcionalmente es posible proporcionar en el directorio de cada artículo también un fichero `poster.png` de 2400×1260 que se mostrará al compartir el artículo en redes sociales. En [`/posters/generator`](https://jaime.gomezobregon.com/posters/generator) he añadido un sencillo generador de estos pósters, basado en [el trabajo previo de George Francis](https://georgefrancis.dev/writing/generative-svg-social-images/).

# Tecnología

Este proyecto utiliza exclusivamente estándares web: HTML5, CSS3 y ES6 (JavaScript). No hay ningún lenguaje de *scripting* en el lado del servidor, ni se requiere de una base de datos.

Es necesario un servidor web capaz de interpretar las sencillas reglas de reescritura del fichero [`.htaccess`](/httpdocs/.htaccess). Por ejemplo, Apache.

La imagen específica de cada artículo para redes sociales (`poster.png`) solo se mostrará si el servidor dispone de PHP 7.4 o superior.

# El manifiesto: un tributo a las cosas sencillas

En 2003 presenté mi Proyecto Fin de Carrera, sobre **sistemas de gestión de contenidos** (CMS, por sus siglas en inglés). Desde entonces y hasta 2020 he trabajado con cientos de implantaciones de decenas de CMS diferentes. En este proyecto he querido dotarme del *anti-CMS*.

**El SEO, la publicidad online y el abuso de CMS como WordPress han destruido la web**: los autores ya no escriben artículos para los lectores, sino para *generar tráfico*. Y los técnicos ya no escriben código para los navegadores de los usuarios, sino para *posicionar bien en buscadores*. Es una perversión de los principios.

Yo aquí me apeo de ese mundo. Considero que hace falta **un reinicio, una transvaloración radical**: volver a poner a los usuarios en el centro y regresar a la esencia desnuda de las cosas.

- **Menos es más.** Este sitio no tiene un buscador porque no hace falta: el navegador del usuario ya tiene uno. Y en internet hay más. Tampoco necesita este blog de una base de datos. No es necesaria. Aquí no hay política de privacidad porque no se recaba ningún dato personal, ni siquiera la dirección IP del visitante. También he erradicado todo ornamento. ¡Viva la bella sobriedad, la sublime austeridad en el ornato! Las imágenes genéricas, de *stock*, son una decoración irrelevante.

- **Excelencia técnica.** Este sitio web utiliza exclusivamente tecnologías modernas y estándar: HTML5, CSS3 y ES6 (JavaScript). Aquí escribo marcado semántico, código válido conforme a las especificaciones, y proporciono metadatos a los contenidos. No utilizo clases (`class`) ni identificadores (`id`): es el sueño del tecnomarxista actual: un documento sin clases.

- **Muerte a la estupidez de las «cookies».** La ley europea obliga a informar al usuario antes de instalar *cookies* de seguimiento en su navegador, y eso está bien. Pero la gran mayoría de los sitios web **en realidad no necesitarían instalar ninguna cookie**. Pero lo excepcional se ha convertido en norma y ahora hasta los sitios web más anodinos requieren docenas de *cookies* y molestan al usuario pidiendo su consentimiento para instalarlas. Este es mi sitio web, y no instalará ninguna cookie en tu navegador. Por lo tanto, tampoco te molestará pidiéndote consentimiento.

- **No analizo el tráfico del sitio**. Esta es otra moderna obsesión: la de contar *las visitas* y trazar vistosas gráficas de tráfico online. En mi blog no escribo para batir ningún récord de visitas. La mayoría de las veces estas métricas solo alimentan vanidades, y usar Google Analytics refuerza la posición monopolística de Google.

- **Más rápido que la luz**. [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/) le otorga a este blog una puntuación de entre 95 y 99 puntos sobre cien. Pero mi objetivo con este proyecto no ha sido ganar muchos puntos ahí, sino ofrecer a los usuarios la mejor experiencia de usuario posible.

- **Me niego a escribir para buscadores**. Yo escribo castellano correcto para lectores alfabetizados, y marcado con código HTML5 semántico y válido conforme la especificación del W3C. Me ciño al estándar. Y luego que los buscadores hagan lo que quieran.

- **Simple de mantener**. La locura de los CMS no tiene límites: actualizaciones, parches de seguridad, *plugins* y plantillas, *sitemaps*, metaetiquetas, cachés... Este sitio da la espalda a todo eso. Es un simple conjunto de ficheros estáticos y 200 líneas de JavaScript. No hay ninguna compleja arquitectura de software que mantener. Y es sano así. Cuando quiero escribir un artículo, simplemente creo un fichero y lo publico con un <em>commit</em> y un <em>push</em>. Y ya.

- **Con un licenciamiento claro y permisivo**. Tanto el código del sitio como sus contenidos los publico bajo licencias libres. Estando ambas cosas complatemente expuestas en internet, no tiene mucho sentido hacerlo de otro modo.

# Licencia

Los contenidos de mi blog están publicados bajo licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.es): puedes reutilizarlos citando que soy su autor y enlazando a la versión original.

El código fuente de este blog [lo he publicado en Github](github.com/jaimeobregon/jaime.gomezobregon.com) y lo libero bajo licencia [AGPL 3.0](/LICENSE). Puedes reutilizarlo atendiendo lo que establece la licencia.
