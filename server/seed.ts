import { drizzle } from "drizzle-orm/mysql2";
import { hymns } from "../drizzle/schema";

import type { HymnSlide } from "../drizzle/schema";

const HYMNS_DATA: Array<{ number: number; title: string; author: string; category: string; slides: HymnSlide[] }> = [
  {
    number: 1,
    title: "Cuán Grande Es Él",
    author: "Carl Boberg / Stuart K. Hine",
    category: "Adoración",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Señor mi Dios, al contemplar los cielos\nEl firmamento y las estrellas mil\nAl oír tu voz en los potentes truenos\nY ver brillar al sol en su cenit" },
      { type: "chorus", label: "Coro", text: "Entonces mi alma canta:\n¡Cuán grande es Él! ¡Cuán grande es Él!\nEntonces mi alma canta:\n¡Cuán grande es Él! ¡Cuán grande es Él!" },
      { type: "verse", label: "Estrofa 2", text: "Al recorrer los montes y los valles\nY ver las flores del jardín al sol\nAl escuchar el canto de las aves\nY el murmurar del claro manantial" },
      { type: "verse", label: "Estrofa 3", text: "Cuando recuerdo que en la cruz un día\nCargó el Señor mi deuda de pecado\nY que al volver a su mansión de gloria\nMe llevará con Él a su morada" },
    ],
  },
  {
    number: 2,
    title: "Santo, Santo, Santo",
    author: "Reginald Heber",
    category: "Adoración",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Santo, Santo, Santo, Señor Omnipotente\nSiempre el labio mío loores te dará\nSanto, Santo, Santo, te adoro reverente\nDios en tres personas, bendita Trinidad" },
      { type: "verse", label: "Estrofa 2", text: "Santo, Santo, Santo, en numerosa hueste\nMártires y santos te adoran con fervor\nLos que vencedores son en la celeste\nPrestan homenaje de gloria al Creador" },
      { type: "verse", label: "Estrofa 3", text: "Santo, Santo, Santo, la inmensa muchedumbre\nDe ángeles que cumplen tu santa voluntad\nAnte ti se postra, bañada de tu lumbre\nAnte el mar de vidrio, canta tu bondad" },
      { type: "verse", label: "Estrofa 4", text: "Santo, Santo, Santo, Señor Omnipotente\nToda tu obra alaba tu excelso nombre y ser\nSanto, Santo, Santo, te adoro reverente\nDios en tres personas, bendita Trinidad" },
    ],
  },
  {
    number: 3,
    title: "A Dios el Padre Celestial",
    author: "Thomas Ken",
    category: "Alabanza",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "A Dios el Padre celestial\nAl Hijo nuestro Redentor\nAl eternal Consolador\nUnidos todos alabad" },
      { type: "chorus", label: "Coro", text: "¡Amén! ¡Amén! ¡Amén!\nA Dios la gloria sea\n¡Amén! ¡Amén! ¡Amén!" },
    ],
  },
  {
    number: 4,
    title: "Sublime Gracia",
    author: "John Newton",
    category: "Gracia",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Sublime gracia del Señor\nQue a un infeliz salvó\nFui ciego mas hoy veo yo\nPerdido y Él me halló" },
      { type: "verse", label: "Estrofa 2", text: "Su gracia me enseñó a temer\nMis dudas ahuyentó\nOh cuán precioso fue a mi ser\nCuando Él me transformó" },
      { type: "verse", label: "Estrofa 3", text: "En los peligros o aflicción\nQue yo he tenido aquí\nSu gracia siempre me libró\nY me guiará feliz" },
      { type: "verse", label: "Estrofa 4", text: "Y cuando en Sión por siglos mil\nBrillando esté cual sol\nYo cantaré por siempre allí\nSu amor que me salvó" },
    ],
  },
  {
    number: 5,
    title: "Castillo Fuerte Es Nuestro Dios",
    author: "Martín Lutero",
    category: "Fortaleza",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Castillo fuerte es nuestro Dios\nDefensa y buen escudo\nCon su poder nos librará\nEn todo trance agudo\nCon furia y con afán\nAcósanos Satán\nPor armas deja ver\nAstucia y gran poder\nCual él no hay en la tierra" },
      { type: "verse", label: "Estrofa 2", text: "Luchar aquél por sí no puede\nPues todo bien perdiera\nMas por nosotros pugnará\nDe Dios el elegido\n¿Sabéis quién es? Jesús\nEl que venció en la cruz\nSeñor de Sabaot\nY pues Él solo es Dios\nÉl triunfa en la batalla" },
      { type: "verse", label: "Estrofa 3", text: "Y si demonios mil están\nProntos a devorarnos\nNo temeremos porque Dios\nSabrá aún prosperarnos\nQue muestre su vigor\nSatán y su furor\nDañarnos no podrá\nPues condenado es ya\nUna palabra lo vence" },
    ],
  },
  {
    number: 6,
    title: "Jesús Es Mi Rey Soberano",
    author: "Vicente Mendoza",
    category: "Alabanza",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Jesús es mi Rey soberano\nMi gozo es cantar su loor\nEs Rey y me ve como hermano\nEs Rey y me llama su amor" },
      { type: "chorus", label: "Coro", text: "¡Cuán dulce es el Rey que me salva!\n¡Cuán dulce es el Rey que me amó!\nCon Él en la gloria me espera\nUn trono que Él me prometió" },
      { type: "verse", label: "Estrofa 2", text: "Jesús es mi amigo anhelado\nY en sombras o en luz siempre va\nConmigo en lo más apartado\nSu amor y su paz me dará" },
      { type: "verse", label: "Estrofa 3", text: "Jesús en su Palabra me dice\nQue pronto vendrá otra vez\nY que en su morada propicia\nEstaré con Él de una vez" },
    ],
  },
  {
    number: 7,
    title: "Hay Poder en la Sangre",
    author: "Lewis E. Jones",
    category: "Salvación",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "¿Quieres ser libre de la carga del mal?\nHay poder en la sangre del Cordero\n¿Quieres vivir sobre el mundo triunfal?\nHay poder en la sangre del Señor" },
      { type: "chorus", label: "Coro", text: "Hay poder, poder, sin igual poder\nEn Jesús quien murió\nHay poder, poder, sin igual poder\nEn la sangre que Él vertió" },
      { type: "verse", label: "Estrofa 2", text: "¿Quieres ser libre de orgullo y pasión?\nHay poder en la sangre del Cordero\n¿Quieres recibir la más rica bendición?\nHay poder en la sangre del Señor" },
      { type: "verse", label: "Estrofa 3", text: "¿Quieres hacer por Jesús grande bien?\nHay poder en la sangre del Cordero\n¿Quieres vivir y reinar con Él también?\nHay poder en la sangre del Señor" },
    ],
  },
  {
    number: 8,
    title: "Firmes y Adelante",
    author: "Sabine Baring-Gould",
    category: "Marcha Cristiana",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Firmes y adelante, huestes de la fe\nSin temor alguno, que Jesús nos ve\nJefe soberano, Cristo al frente va\nY la regia enseña tremoland está" },
      { type: "chorus", label: "Coro", text: "Firmes y adelante, huestes de la fe\nSin temor alguno, que Jesús nos ve" },
      { type: "verse", label: "Estrofa 2", text: "Al sagrado nombre de nuestro Adalid\nTiembla el enemigo y huye de la lid\nNuestra es la victoria, dad a Dios loor\nY óigase en los cielos himno de alabor" },
      { type: "verse", label: "Estrofa 3", text: "Muévese potente la Iglesia de Dios\nHermanos marchemos todos a una voz\nSomos solo un cuerpo y uno es el Señor\nUna la esperanza y uno nuestro amor" },
    ],
  },
  {
    number: 9,
    title: "Cuando Allá Se Pase Lista",
    author: "James M. Black",
    category: "Esperanza",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Cuando la trompeta suene en aquel día final\nY que el alba eterna rompa en claridad\nCuando las naciones salvas a su patria lleguen ya\nY que sea pasada lista allá" },
      { type: "chorus", label: "Coro", text: "Cuando allá se pase lista\nCuando allá se pase lista\nCuando allá se pase lista\nA mi nombre yo feliz responderé" },
      { type: "verse", label: "Estrofa 2", text: "En aquel día venturoso en que los muertos vivirán\nY los que queden transformados serán\nCuando como resplandores los redimidos brillarán\nY que sea pasada lista allá" },
    ],
  },
  {
    number: 10,
    title: "Tal Como Soy",
    author: "Charlotte Elliott",
    category: "Salvación",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Tal como soy de pecador\nSin más remedio que tu amor\nA ti me llego, oh mi Señor\nCordero de Dios, heme aquí" },
      { type: "verse", label: "Estrofa 2", text: "Tal como soy buscando paz\nQue solo en ti se encontrará\nEn mi maldad tú me sanarás\nCordero de Dios, heme aquí" },
      { type: "verse", label: "Estrofa 3", text: "Tal como soy me recibirás\nPerdón y vida me darás\nTu amor y gracia me mostrarás\nCordero de Dios, heme aquí" },
    ],
  },
  {
    number: 11,
    title: "Yo Tengo Gozo en Mi Alma",
    author: "Eliza E. Hewitt",
    category: "Gozo",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Yo tengo gozo en mi alma hoy\nGozo en mi alma hoy\nGozo en mi alma hoy\nDesde que el Señor me salvó" },
      { type: "chorus", label: "Coro", text: "¡Gloria! ¡Gloria! ¡Cuánta gloria!\n¡Gloria! ¡Gloria! ¡Cuánta gloria!\n¡Gloria! ¡Gloria! ¡Cuánta gloria!\nDesde que el Señor me salvó" },
      { type: "verse", label: "Estrofa 2", text: "Yo tengo paz en mi alma hoy\nPaz en mi alma hoy\nPaz en mi alma hoy\nDesde que el Señor me salvó" },
      { type: "verse", label: "Estrofa 3", text: "Yo tengo amor en mi alma hoy\nAmor en mi alma hoy\nAmor en mi alma hoy\nDesde que el Señor me salvó" },
    ],
  },
  {
    number: 12,
    title: "Dios Os Guarde",
    author: "Tradicional",
    category: "Bendición",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Dios os guarde, Dios os guarde\nHasta que nos encontremos\nBajo su dirección, en su amor y protección\nDios os guarde hasta entonces" },
    ],
  },
  {
    number: 13,
    title: "Más Cerca, Oh Dios, de Ti",
    author: "Sarah F. Adams",
    category: "Devoción",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Más cerca, oh Dios, de Ti\nMás cerca de Ti\nAunque sea una cruz\nLo que me haga subir\nMás cerca, oh Dios, de Ti\nMás cerca de Ti" },
      { type: "verse", label: "Estrofa 2", text: "Aunque como Jacob\nSin patria ni hogar\nPiedras por cabecera\nTenga que descansar\nMás cerca, oh Dios, de Ti\nMás cerca de Ti" },
      { type: "verse", label: "Estrofa 3", text: "Entonces mi canción\nSerá en el amanecer\nMás cerca, oh Dios, de Ti\nMás cerca de Ti" },
    ],
  },
  {
    number: 14,
    title: "Aleluya, Cuán Hermoso",
    author: "Tradicional",
    category: "Alabanza",
    slides: [
      { type: "chorus", label: "Coro", text: "Aleluya, cuán hermoso\nEs el nombre del Señor\nAleluya, cuán glorioso\nEs su nombre, es su amor" },
      { type: "verse", label: "Estrofa 1", text: "Jesús, Jesús, tu nombre es bello\nJesús, Jesús, tu nombre es luz\nJesús, Jesús, en ti me gozo\nJesús, Jesús, mi dulce Jesús" },
    ],
  },
  {
    number: 15,
    title: "Maravillosa Gracia",
    author: "Haldor Lillenas",
    category: "Gracia",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Maravillosa gracia del buen Señor\nGracia que excede todo mi pecado\nAllá en el Calvario el Señor murió\nPara que el hombre fuera perdonado" },
      { type: "chorus", label: "Coro", text: "Maravillosa la infinita gracia\nGracia que perdona el pecado atroz\nGracia que es más grande que toda falta\nGracia del Señor, maravillosa gracia" },
      { type: "verse", label: "Estrofa 2", text: "Maravillosa gracia que me salvó\nCuando en el pecado yo me hallaba\nJesús en la cruz por mí se entregó\nY con su sangre preciosa me lavaba" },
    ],
  },
  {
    number: 16,
    title: "Jesús, Amante de Mi Alma",
    author: "Charles Wesley",
    category: "Devoción",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Jesús, amante de mi alma\nDéjame en tu seno descansar\nMientras pasa la tormenta\nHasta que las aguas se calmen\nOcúltame, oh mi Salvador\nHasta que la tormenta pase\nSé tú mi guía y mi consuelo\nEn tu amor seguro estaré" },
      { type: "verse", label: "Estrofa 2", text: "Tú, oh Cristo, eres todo lo que necesito\nMás que todo en ti encuentro\nAlza al caído, anima al débil\nSana al enfermo, enriquece al pobre\nTú de gracia eres la fuente\nDéjame siempre de ella beber\nTú de vida eres la fuente\nCúbreme con tu poder" },
    ],
  },
  {
    number: 17,
    title: "Sé Tú Mi Visión",
    author: "Tradicional Irlandesa",
    category: "Devoción",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Sé tú mi visión, oh Señor de mi ser\nNada hay que yo estime más que a ti tener\nTú eres mi mejor pensamiento de día y de noche\nDespierto o dormido tu presencia es mi luz" },
      { type: "verse", label: "Estrofa 2", text: "Sé tú mi sabiduría, sé tú mi verdad\nTú eres mi Padre, yo tu hijo seré\nTú en mí habitando y yo unido a ti\nPadre de los cielos, tu amor es mi bien" },
      { type: "verse", label: "Estrofa 3", text: "Riquezas no busco ni honores del mundo\nTú eres mi herencia ahora y siempre\nTú y solo tú, el primero en mi corazón\nRey de los cielos, mi victoria eres tú" },
    ],
  },
  {
    number: 18,
    title: "Alabad al Gran Rey",
    author: "Tradicional",
    category: "Alabanza",
    slides: [
      { type: "chorus", label: "Coro", text: "Alabad al gran Rey\nAlabad al gran Rey\nAlabad, alabad, alabad al gran Rey" },
      { type: "verse", label: "Estrofa 1", text: "Venid y adoremos\nAl Señor con fervor\nDoblemos la rodilla\nAnte el Creador" },
    ],
  },
  {
    number: 19,
    title: "Hay Una Fuente Sin Igual",
    author: "William Cowper",
    category: "Salvación",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Hay una fuente sin igual\nDe sangre de Emmanuel\nEn donde el pecador lavar\nSus manchas puede bien" },
      { type: "verse", label: "Estrofa 2", text: "El salteador que en la cruz\nArrepentido fue\nSus culpas vio lavadas en\nLa sangre del Señor" },
      { type: "verse", label: "Estrofa 3", text: "Yo sé que cuando muera aquí\nMi voz se callará\nPero en la gloria cantaré\nDel Cordero el amor" },
    ],
  },
  {
    number: 20,
    title: "Dios Está Aquí",
    author: "Graham Kendrick",
    category: "Presencia de Dios",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Dios está aquí, tan cierto como el aire que respiro\nTan cierto como la mañana se levanta\nTan cierto como que le canto y Él me escucha\nDios está aquí" },
      { type: "chorus", label: "Coro", text: "Él está aquí, Él está aquí\nDios está aquí\nÉl está aquí, Él está aquí\nDios está aquí" },
      { type: "verse", label: "Estrofa 2", text: "Dios está aquí, más íntimo que mi propio aliento\nMás cercano que las manos y los pies\nTan real como en este momento que le busco\nDios está aquí" },
    ],
  },
  {
    number: 21,
    title: "Cuan Bello Es el Señor",
    author: "Tradicional",
    category: "Adoración",
    slides: [
      { type: "chorus", label: "Coro", text: "Cuán bello es el Señor\nCuán bello es el Señor\nCuán bello, cuán bello, cuán bello es el Señor" },
      { type: "verse", label: "Estrofa 1", text: "En el cielo y en la tierra\nSu gloria se proclama\nToda lengua le alabe\nTodo ser le adore" },
    ],
  },
  {
    number: 22,
    title: "Tuyo Soy, Jesús",
    author: "Fanny Crosby",
    category: "Consagración",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Tuyo soy, Jesús, a ti me rindo\nGuíame, guíame en tu amor\nPor la senda oscura voy caminando\nSé mi luz, mi guía, mi Señor" },
      { type: "chorus", label: "Coro", text: "Tuyo soy, Jesús, tuyo soy\nA ti me entrego hoy\nTuyo soy, Jesús, tuyo soy\nA ti me entrego hoy" },
      { type: "verse", label: "Estrofa 2", text: "Tuyo soy, Jesús, en ti confío\nTú me das la paz y el gozo fiel\nEn tus brazos fuertes me recibo\nSalvo estoy, seguro estoy en Él" },
    ],
  },
  {
    number: 23,
    title: "Oh Qué Amigo Nos Es Cristo",
    author: "Joseph M. Scriven",
    category: "Oración",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Oh qué amigo nos es Cristo\nÉl llevó nuestro dolor\nY nos manda que llevemos\nTodo a Dios en oración\n¿Vive el hombre desprovisto\nDe paz, gozo y santo amor?\nEsto es porque no llevamos\nTodo a Dios en oración" },
      { type: "verse", label: "Estrofa 2", text: "¿Vives débil y cargado\nDe cuidados y temor?\nA Jesús, refugio eterno\nDile todo en oración\n¿Te desprecian tus amigos?\nCuéntaselo en oración\nEn sus brazos de amor tierno\nPaz tendrá tu corazón" },
      { type: "verse", label: "Estrofa 3", text: "Jesucristo es nuestro amigo\nDe esto prueba nos mostró\nPues sufrió el más vil oprobio\nY su sangre por nos dio\nEn Getsemaní angustiado\nÉl a Dios clamó en oración\nSea Jesús nuestro modelo\nY oremos con devoción" },
    ],
  },
  {
    number: 24,
    title: "Jesús, Yo He Prometido",
    author: "John E. Bode",
    category: "Consagración",
    slides: [
      { type: "verse", label: "Estrofa 1", text: "Jesús, yo he prometido\nServirte con amor\nSé tú mi fiel amigo\nMi guía y mi Señor\nEl mundo está muy cerca\nY acecha con afán\nMas tú que estás más cerca\nMe guardarás del mal" },
      { type: "verse", label: "Estrofa 2", text: "Jesús, tú has prometido\nA todo el que te sigue\nQue donde tú estuvieres\nAllí también estén\nY Jesús, yo te sigo\nPor fe en tu Palabra\nY en tu mansión de gloria\nEstaré junto a ti" },
    ],
  },
  {
    number: 25,
    title: "Glorioso Es Tu Nombre",
    author: "Tradicional",
    category: "Alabanza",
    slides: [
      { type: "chorus", label: "Coro", text: "Glorioso es tu nombre\nBendito Salvador\nGlorioso es tu nombre\nOh Cristo mi Señor\nEn ti me glorío\nEn ti tengo mi ser\nGlorioso es tu nombre\nOh Cristo mi Señor" },
      { type: "verse", label: "Estrofa 1", text: "Cuando en la mañana\nA ti elevo mi voz\nCuando en la noche\nTe busco en oración\nEn todo momento\nTu nombre alabaré\nGlorioso es tu nombre\nOh Cristo mi Señor" },
    ],
  },
];

async function seed() {
  const db = drizzle(process.env.DATABASE_URL!);
  console.log("Seeding hymns...");

  for (const hymn of HYMNS_DATA) {
    try {
      await db.insert(hymns).values({
        number: hymn.number,
        title: hymn.title,
        author: hymn.author,
        category: hymn.category,
        slides: hymn.slides,
      });
      console.log(`  ✓ ${hymn.number}. ${hymn.title}`);
    } catch (err: any) {
      if (err?.message?.includes("Duplicate")) {
        console.log(`  ~ ${hymn.number}. ${hymn.title} (ya existe)`);
      } else {
        console.error(`  ✗ ${hymn.title}:`, err?.message);
      }
    }
  }

  console.log(`\nSeed completado: ${HYMNS_DATA.length} himnos procesados.`);
  process.exit(0);
}

seed().catch(console.error);
