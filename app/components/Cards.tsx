import Image from "next/image";

interface props {
  title: string;
  description: string;
}

export const Cards = ({ title, description }: props) => {
  return (
    <div className="card card-top lg:card-side bg-secondary-300 shadow-sm w-100 mx-auto">
      <figure>
        <Image
          src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
          alt="Movie"
          width={400}
          height={300}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};
