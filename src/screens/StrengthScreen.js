
import { SectionCrudScreen } from '../components/SectionCrudScreen';

// Define y exporta la pantalla de Fuerza.
// Recibe las propiedades enviadas desde HomeScreen.
export default function StrengthScreen(props) {

  // Retorna el componente reutilizable para gestionar los registros.
  return (
    <SectionCrudScreen

      // Transfiere todas las propiedades recibidas.
      {...props}

      // Identificador único de la sección de Fuerza.
      sectionId="strength"

      // Título que aparecerá en la pantalla.
      title="Fuerza"

      // Descripción que verá el usuario.
      subtitle="Administra ejercicios y series de fuerza."
    />
  );
}
