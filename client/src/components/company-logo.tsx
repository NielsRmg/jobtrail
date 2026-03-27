import { useState } from "react";

interface Props {
  company: string;
  className?: string;
}

function guessDomain(company: string): string {
  return (
    company
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "") + ".com"
  );
}

export function CompanyLogo({ company, className = "h-8 w-8" }: Props) {
  const [visible, setVisible] = useState(true);
  const domain = guessDomain(company);

  if (!visible) return null;

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt=""
      className={`${className} rounded object-contain`}
      onError={() => setVisible(false)}
      loading="lazy"
    />
  );
}
