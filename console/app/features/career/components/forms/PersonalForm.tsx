type Props = {
  values: any;
  onChange: (name: string, value: any) => void;
};

export default function PersonalForm({ values, onChange }: Props) {
  return (
    <div className="space-y-12">

      {/* ================= PERSONAL DETAILS ================= */}
      <Section title="Personal Details">
        <Grid cols={3}>

          <Field label="First name *">
            <input
              className={inputClass}
              value={values.first_name || ""}
              onChange={(e) => onChange("first_name", e.target.value)}
            />
          </Field>

          <Field label="Last name *">
            <input
              className={inputClass}
              value={values.last_name || ""}
              onChange={(e) => onChange("last_name", e.target.value)}
            />
          </Field>

          <Field label="Date of birth">
            <input
              type="date"
              className={inputClass}
              value={values.dob || ""}
              onChange={(e) => onChange("dob", e.target.value)}
            />
          </Field>

          <Field label="Gender">
            <select
              className={inputClass}
              value={values.gender || ""}
              onChange={(e) => onChange("gender", e.target.value)}
            >
              <option value="">Select an option</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Marital status">
            <select
              className={inputClass}
              value={values.marital_status || ""}
              onChange={(e) => onChange("marital_status", e.target.value)}
            >
              <option value="">Select an option</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </Field>

          <Field label="Blood group">
            <input
              className={inputClass}
              value={values.blood_group || ""}
              onChange={(e) => onChange("blood_group", e.target.value)}
            />
          </Field>

          <Field label="Nationality">
            <input
              className={inputClass}
              value={values.nationality || "Indian"}
              onChange={(e) => onChange("nationality", e.target.value)}
            />
          </Field>

          <Field label="Personal email">
            <input
              type="email"
              className={inputClass}
              value={values.personal_email || ""}
              onChange={(e) => onChange("personal_email", e.target.value)}
            />
          </Field>

          <Field label="Mobile number *">
            <input
              type="tel"
              className={inputClass}
              placeholder="Enter mobile number"
              value={values.mobile || ""}
              onChange={(e) => onChange("mobile", e.target.value)}
            />
          </Field>

        </Grid>
      </Section>

      {/* ================= ADDRESS ================= */}
      <Section title="Contact & Address">
        <Grid cols={2}>

          <Field label="Current address">
            <textarea
              rows={4}
              className={textareaClass}
              value={values.current_address || ""}
              onChange={(e) => onChange("current_address", e.target.value)}
            />
          </Field>

          <Field label="Permanent address">
            <textarea
              rows={4}
              className={textareaClass}
              value={values.permanent_address || ""}
              onChange={(e) => onChange("permanent_address", e.target.value)}
            />
          </Field>

        </Grid>
      </Section>

      {/* ================= EMERGENCY CONTACT ================= */}
      <Section title="Emergency Contact">
        <Grid cols={3}>

          <Field label="Contact person name *">
            <input
              className={inputClass}
              value={values.emergency_name || ""}
              onChange={(e) =>
                onChange("emergency_name", e.target.value)
              }
            />
          </Field>

          <Field label="Relationship">
            <input
              className={inputClass}
              placeholder="Father / Mother / Spouse"
              value={values.emergency_relation || ""}
              onChange={(e) =>
                onChange("emergency_relation", e.target.value)
              }
            />
          </Field>

          <Field label="Emergency mobile number *">
            <input
              type="tel"
              className={inputClass}
              placeholder="Emergency contact number"
              value={values.emergency_mobile || ""}
              onChange={(e) =>
                onChange("emergency_mobile", e.target.value)
              }
            />
          </Field>

        </Grid>
      </Section>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#2f3342] bg-[#0b0d12] p-6">
      <h3 className="mb-6 text-lg font-semibold text-white">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Grid({
  cols,
  children,
}: {
  cols: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-${cols} gap-x-10 gap-y-8`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ================= TAILWIND INPUT STYLES ================= */

const inputClass =
  "w-full rounded-lg border border-[#2f3342] bg-[#0b0d12] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const textareaClass =
  "w-full rounded-lg border border-[#2f3342] bg-[#0b0d12] px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none";




