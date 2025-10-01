export default function TestPage({ params }: { params: { id: string } }) {
    return <div>Test route works! id={params.id}</div>;
  }
  