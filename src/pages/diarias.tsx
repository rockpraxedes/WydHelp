import header from "../images/header.jpg";

export default function Diarias() {
  return (
    <div className="min-h-screen flex justify-center pt-10">
      {/* Container geral */}
      <div className="w-full flex justify-center relative">
        {/* Header */}
        <div
          className="relative h-[200px] w-[700px] rounded-xl overflow-hidden"
          style={{
            backgroundImage: `url(${header})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay leve (opcional) */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>
      {/* Conteúdo abaixo */}
      <div className="absolute top-[260px] w-full max-w-xl p-8">
        {/* resto da página */}
      </div>
    </div>
  );
}
