//TODO - this isnt styled properly
//fix styles eventually after important things are covered first

interface DashboardPopoverInfoProps {
  text: string;
  bg?: string;
}

export default function DashboardPopoverInfo({
  text,
  bg,
}: DashboardPopoverInfoProps) {
  const addLineBreaksToText = (text: string): JSX.Element[] => {
    const withLineBreaks: JSX.Element[] = text.split(" ").map((t, index) =>
      index && index % 5 === 0 ? (
        <span key={index}>
          {t} <br />
        </span>
      ) : (
        <span key={index}>{t} </span>
      ),
    );

    return withLineBreaks;
  };

  return (
    <div className="invisible absolute bottom-5 right-0 z-10 min-w-max transition-transform duration-200 [transform:scale(0.95)_translateZ(0px)] group-hover:visible">
      <section
        style={{ boxShadow: "0px 24px 48px rgba(0, 0, 0, 0.16)" }}
        role="tooltip"
        className={`${
          bg ?? "bg-white"
        } invisible relative flex flex-col rounded-md text-dashboard-activeTab opacity-0 transition-transform duration-200 [transform:scale(0.95)_translateZ(0px)] group-hover:visible group-hover:opacity-100`}
      >
        <div className="py-3 pe-5 ps-3">
          <p className="text-sm font-normal leading-5">
            {addLineBreaksToText(text)}
          </p>
        </div>
      </section>
    </div>
  );
}
