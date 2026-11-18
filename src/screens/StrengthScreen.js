import { SectionCrudScreen } from '../components/SectionCrudScreen';

export default function StrengthScreen(props) {
  return (
    <SectionCrudScreen
      {...props}
      sectionId="strength"
      title="Fuerza"
      subtitle="Administra ejercicios y series de fuerza."
    />
  );
}
