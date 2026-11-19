import { SectionCrudScreen } from '../components/SectionCrudScreen';

export default function HydrationScreen(props) {
  return (
    <SectionCrudScreen
      {...props}
      sectionId="hydration"
      title="Hidratación"
      subtitle="Lleva una lista de tus recordatorios de agua."
    />
  );
}
