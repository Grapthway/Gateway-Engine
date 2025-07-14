
import localFont from 'next/font/local';

export const MaisonNeue = localFont(
  {
    src: [
      {
        path: "../../assets/fonts/maison-neue/MaisonNeue-Medium.otf",
        weight: "500",
        style: "normal"
      },
      {
        path: "../../assets/fonts/maison-neue/MaisonNeue-Demi.otf",
        weight: "600",
        style: "normal"
      },
      {
        path: "../../assets/fonts/maison-neue/MaisonNeue-Bold.otf",
        weight: "700",
        style: "normal"
      },
      {
        path: "../../assets/fonts/maison-neue/MaisonNeueExtended-Bold.otf",
        weight: "800",
        style: "normal"
      },
    ],
    variable: "--font-maison-neue"
  },
);

