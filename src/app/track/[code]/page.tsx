import { TrackClient } from './TrackClient';

export function generateStaticParams() {
  return [
    { code: 'demo' },
    { code: 'LA-CN-260901-001' },
    { code: 'LA-TH-260901-002' },
    { code: 'LA-CN-260902-003' },
  ];
}

export default function PublicTrackingPage({ params }: { params: { code: string } }) {
  return <TrackClient code={params?.code} />;
}
