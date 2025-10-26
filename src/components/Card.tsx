import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  style?: string;
};

function Card({ children, style }: CardProps){
  return(
    <div className={`px-4 py-2 w-fit h-fit border rounded-lg shadow-md ${style || ""}`}>
      {children}
    </div>
  );
}

export default Card;