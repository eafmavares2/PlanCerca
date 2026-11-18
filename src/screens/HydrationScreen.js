
// Importa el componente SectionCrudScreen desde la carpeta components.
// Este componente contiene la estructura y las funcionalidades CRUD
// que se reutilizan en las diferentes secciones de la aplicación.
import { SectionCrudScreen } from '../components/SectionCrudScreen';

// Define y exporta el componente HydrationScreen.
// props recibe las propiedades que se envían desde otro componente.
export default function HydrationScreen(props) {

  // Retorna el contenido visual de la pantalla de Hidratación.
  return (

    // Utiliza SectionCrudScreen para construir la pantalla.
    <SectionCrudScreen

      // Transfiere todas las propiedades recibidas mediante props.
      {...props}

      // Identifica esta sección con el nombre hydration.
      sectionId="hydration"

      // Establece el título que aparecerá en la pantalla.
      title="Hidratación"

      // Establece la descripción de la sección.
      subtitle="Lleva una lista de tus recordatorios de agua."

    />
  );
}
