import { SectionCrudScreen } from '../components/SectionCrudScreen';

export default function NutritionScreen(props) {
  return (
    <SectionCrudScreen
      {...props}
      sectionId="nutrition"
      title="Nutrición"
      subtitle="Organiza hábitos y notas de alimentación."
    />
  );
}
