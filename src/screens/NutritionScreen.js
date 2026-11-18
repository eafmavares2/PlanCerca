
import { SectionCrudScreen } from '../components/SectionCrudScreen';

// Define y exporta la pantalla de Nutrición.
// Recibe las propiedades enviadas desde HomeScreen.
export default function NutritionScreen(props) {

  // Retorna el componente reutilizable de gestión de registros.
  return (
    <SectionCrudScreen

      // Transfiere todas las propiedades recibidas.
      {...props}

      // Identificador único de la sección de Nutrición.
      sectionId="nutrition"

      // Título que aparecerá en la pantalla.
      title="Nutrición"

      // Descripción que verá el usuario.
      subtitle="Organiza hábitos y notas de alimentación."
    />
  );
}
