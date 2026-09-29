import { redirect } from 'next/navigation';

export default function ImmersiveDestinationPage({ params }: { params: { destination: string } }) {
  const dest = params.destination || 'delhi';
  redirect(`/immersive?city=${encodeURIComponent(dest)}`);
}
