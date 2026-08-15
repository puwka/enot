import React from 'react';
import Education from '../components/Education';
import logocar from '../images/logocar.webp'; // Импортируем картинку
import psiho from '../images/psiho.webp'; // Импортируем картинку
import insperian from '../images/insperian.webp'; // Импортируем картинку
import skilkids from '../images/skilkids.webp'; // Импортируем картинку
import ipo from '../images/ipo.webp'; // Импортируем картинку
import easy from '../images/easy.webp'; // Импортируем картинку
import mds from '../images/mds.webp'; // Импортируем картинку
import runo from '../images/runo.webp'; // Импортируем картинку
import school1 from '../images/school1.webp'; // Импортируем картинку
import mti from '../images/mti.webp'; // Импортируем картинку
import bonnie from '../images/bonnie.webp'; // Импортируем картинку
import lend from '../images/lend.webp'; // Импортируем картинку
import miin from '../images/miin.webp'; // Импортируем картинку
import tochkaznanii from '../images/tochkaznanii.webp'; // Импортируем картинку
import smart from '../images/smart.webp'; // Импортируем картинку
import merion from '../images/merion.webp'; // Импортируем картинку
import mbi from '../images/mbi.webp'; // Импортируем картинку
import mipo from '../images/mipo.webp'; // Импортируем картинку
import algo from '../images/algo.webp'; // Импортируем картинку







const Educ = () => {
  const demoData = [
    {
      naprav: 'Психология и коучинг',
      image: psiho, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/6wph8?erid=2VtzqvtrNqM'
    },
    {
      naprav: 'Школа по подготовке к ЕГЭ и ОГЭ',
      image: insperian, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/cvo45?erid=2VtzqvPR239'
    },
    {
      naprav: 'ИТ, дизайн и создание игр',
      image: skilkids, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/zain6?erid=2VtzquibDyZ'
    },
    {
      naprav: 'Проф. переподготовка',
      image: ipo, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/ehqrc?erid=2VtzqwhyoVH'
    },
    {
      naprav: 'Программирование для детей',
      image: easy, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/x48fz?erid=2VtzqwwKThw'
    },
    {
      naprav: 'Юридические профессии',
      image: mds, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/tn5se?erid=2Vtzqwb1Pyx'
    },
    {
      naprav: 'Дополнительное проф. образование',
      image: runo, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/1r63x?erid=2VtzqxmPCfg'
    },
    {
      naprav: 'Доп. образование детей и взрослых',
      image: school1, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/gfclt?erid=2VtzquXyySu'
    },
    {
      naprav: 'Большое количество направлений',
      image: mti, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/jszp1?erid=2VtzqwFQ9oU'
    },
    {
      naprav: 'Разные направления дизайна',
      image: logocar, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/23eog?erid=2VtzqxQJ1Qr'
    },
    {
      naprav: 'Разнообразные направления ИТ',
      image: bonnie, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/blxij?erid=2VtzqwNpytA'
    },
    {
      naprav: 'Подготовка к ЕГЭ и ОГЭ',
      image: lend, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/Jptq2?erid=2VtzqvZqGYW'
    },
    {
      naprav: 'Интегративная нутрициология',
      image: miin, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/9o18b?erid=2VtzqwHS44W'
    },
    {
      naprav: 'Курсы для детей от 5 лет и до 11 класса ',
      image: tochkaznanii, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/mig5J?erid=2VtzqwyFK4y'
    },
    {
      naprav: 'Институт психологии',
      image: smart, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/0qj69?erid=2VtzqwBP3fk'
    },
    {
      naprav: 'Доступное IT-образование',
      image: merion, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/h1yrv?erid=2Vtzqv9afD8'
    },
    {
      naprav: 'Современное бизнес-образование',
      image: mbi, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/u82cm?erid=2VtzqweABux'
    },
    {
      naprav: 'Разные направления психологии',
      image: mipo, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/k5bz0?erid=2VtzquX77Mp'
    },
    {
      naprav: 'Программирование для детей',
      image: algo, // Ссылка на картинку
      link: 'https://my.saleads.pro/s/y6Jeu?erid=2Vtzqv8BaEi'
    },
  ];

  return (
    <div className="page">
      <div className="cards-grid">
        {demoData.map((item) => (
          <Education key={item.bank} {...item} />
        ))}
      </div>
      
    </div>
  );
};
export default Educ;