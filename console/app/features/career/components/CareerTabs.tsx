type Props = {
  active: string;
  onChange: (v: string) => void;
};

const tabs = [
  { key: "personal", label: "Personal Details" },
  { key: "employment", label: "Employment Details" },
  { key: "salary", label: "Compensation & Tax" },
];

export default function CareerTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-3 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`pb-2 px-1 border-b-2 ${
            active === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
