export const SITE = {
  name: "Mossa Orthopedic Care",
  shortName: "Mossa",
  tagline: "Kembali Bergerak, Kembali Bebas Melangkah",
  phoneDisplay: "+62 857-3520-1520",
  phoneWa: "6285735201520",
  email: "mossa.pno@gmail.com",
  hours: "08.00–21.00",
  addresses: [
    {
      label: "Kantor Pusat Sidoarjo",
      line: "Perum Istana Mega Asri Jalan Gunungsari I, B1-14, RT.30/RW.08, Area Sawah, Sumokali, Candi, Sidoarjo Regency, Jawa Timur 61271",
      mapsUrl: "https://maps.app.goo.gl/77gQyJsgi8iLoFih9?g_st=awb",
      embedSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.946069144474!2d112.70057147372007!3d-7.4712080736529645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7e1a5f1304681%3A0xe22e449b55339fe0!2sKAKI%20PALSU%20Sidoarjo%20dan%20sekitar%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1755674726247!5m2!1sid!2sid",
    },
    {
      label: "Kantor Cabang Jember Besuki",
      line: "Jl. Rambipuji - Balung, Krajan Lor, Gumelar, Kec. Balung, Kabupaten Jember, Jawa Timur 68161",
      mapsUrl: "https://maps.app.goo.gl/gA7vEvipnxQ8HyT69",
      embedSrc:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.5540539078306!2d113.55765817373383!3d-8.247515682837152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd68f6cfd27dc81%3A0xc1afa3eaaf6365d7!2sPembuatan%20KAKI%20PALSU%20Jember%20Besuki!5e0!3m2!1sid!2sid!4v1755674862131!5m2!1sid!2sid",
    },
  ],
  social: {
    linktree: "https://linktr.ee/mossa.idn",
    instagram: "https://www.instagram.com/mossa.idn/",
    whatsappCatalog: "https://wa.me/c/6285735201520",
  },
};

export function waLink(message) {
  return `https://wa.me/${SITE.phoneWa}?text=${encodeURIComponent(message)}`;
}

export const WA_DEFAULT_MESSAGE =
  "Assalamu'alaykum.\nMohon izin bertanya terkait produk ...";

export const WA_CONSULT_MESSAGE =
  "Nama:\nAlamat:\nKeluhan:\nRencana Visit:\nHasil Medis: Ada/Tidak Ada";

export function waProductLink(title) {
  return waLink(`Halo Mossa, saya tertarik dengan produk: ${title}. Mohon info lebih lanjut.`);
}
