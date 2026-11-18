
// Importa el componente SectionCrudScreen desde la carpeta components.
// Este componente contiene la estructura y funcionalidades CRUD
// que se reutilizarán en diferentes secciones de la aplicación.
import { SectionCrudScreen } from '../components/SectionCrudScreen';

// Define y exporta la pantalla Cardio.
// props recibe las propiedades que se envían desde el navegador
// o desde el componente que utiliza esta pantalla.
export default function CardioScreen(props) {

  // Retorna el componente principal de esta pantalla.
  return (

    // Utiliza SectionCrudScreen para construir la pantalla de Cardio.
    <SectionCrudScreen

      // Envía todas las propiedades recibidas en props
      // al componente SectionCrudScreen.
      {...props}

      // Identifica esta sección mediante el identificador "cardio".
      sectionId="cardio"

      // Establece el título que aparecerá en la pantalla.
      title="Cardio"

      // Establece el texto descriptivo de la sección.
      subtitle="Planifica intervalos y sesiones cardiovasculares."

    />
  );
}
