import { SectionCrudScreen } from '../components/SectionCrudScreen';

export default function CardioScreen(props) {
  return (
    <SectionCrudScreen
      {...props}
      sectionId="cardio"
      title="Cardio"
      subtitle="Planifica intervalos y sesiones cardiovasculares."
    />
  );
}
