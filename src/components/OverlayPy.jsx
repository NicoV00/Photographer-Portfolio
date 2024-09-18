import { Scroll, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import About1 from "./About1";

const Section = (props) => {
  return (
    <section
      className={`h-screen flex flex-col justify-center p-10 ${
        props.right ? "items-end" : "items-start"
      }`}
      style={{
        opacity: props.opacity,
      }}
    >
      <div className="w-1/2 flex items-center justify-center">
        <div className="max-w-sm w-full">
          <div className="bg-white  rounded-lg px-8 py-12">
            {props.children}
          </div>
        </div>
      </div>
    </section>
  );
};

const HeaderSection = (props) => {
  return (
    <section
      className={`h-screen flex flex-col justify-center p-10 ${
        props.right ? "items-end" : "items-start"
      }`}
      style={{
        opacity: props.opacity,
      }}
    >
      <div className="w-full flex items-center justify-center" style={{height: '100vh'}}>
        <div className="w-full" style={{height: '90vh'}}>
          <div className="bg-white  rounded-lg px-8 py-12" style={{height: '90vh'}}>
            {props.children}
          </div>
        </div>
      </div>
    </section>
  );
};

export const OverlayPy = () => {
    const scroll = useScroll();
    const [opacityFirstSection, setOpacityFirstSection] = useState(1);
    const [opacitySecondSection, setOpacitySecondSection] = useState(1);
    const [opacityLastSection, setOpacityLastSection] = useState(1);
  
    useFrame(() => {
      setOpacityFirstSection(1 - scroll.range(0, 1 / 10));
      setOpacitySecondSection(scroll.curve(0.5 / 10, 1 / 10));
      setOpacityLastSection(scroll.range(1.5 / 10, 1 / 10));
    });

    return (
        <Scroll html>
        <div class="w-screen">
          <HeaderSection opacity={opacityFirstSection}>
            <About1 />
          </HeaderSection>
          <Section right opacity={opacitySecondSection}>
            <h1 className="font-semibold font-serif text-2xl">
              Python 🐍
            </h1>
            <p className="text-gray-500">Python language knowledge:</p>
            <p className="mt-3">
              <b>Frameworks 🚀</b>
            </p>
            <ul className="leading-9">
              <li>Django</li>
              <li>Flask</li>
              <li>FastAPI</li>
            </ul>
            <p className="mt-3">
              <b>Data Analysis 🔬</b>
            </p>
            <ul className="leading-9">
              <li>Pandas</li>
              <li>NumPy</li>
              <li>SCIKit</li>
            </ul>
            <p className="mt-3">
              <b>Automation 👩‍💻</b>
            </p>
            <ul className="leading-9">
              <li>Selenium</li>
              <li>BeautifulSoup</li>
            </ul>
            <p className="animate-bounce  mt-6">↓</p>
          </Section>
          <Section opacity={opacityLastSection}>
          <h1 className="font-semibold font-serif text-2xl">
              React ⚛️
            </h1>
            <p className="text-gray-500">React library knowledge:</p>
            <p className="mt-3">
              <b>Frameworks 🚀</b>
            </p>
            <ul className="leading-9">
              <li>NextJs</li>
              <li>React-Native</li>
            </ul>
            <p className="mt-3">
              <b>User Interface 🎨</b>
            </p>
            <ul className="leading-9">
              <li>Pandas</li>
              <li>NumPy</li>
              <li>SCIKit</li>
            </ul>
            <p className="mt-3">
              <b>Styling 📐</b>
            </p>
            <ul className="leading-9">
              <li>Styled-components</li>
              <li>Boostrap</li>
              <li>Tailwind CSS</li>
            </ul>
            <p className="animate-bounce  mt-6">↓</p>
          </Section>
          <Section right opacity={opacityLastSection}>
            <h1 className="font-semibold font-serif text-2xl">
              Three.js 🌐
            </h1>
            <p className="text-gray-500">Three.js library knowledge:</p>
            <p className="mt-3">
              <b>Frameworks 🚀</b>
            </p>
            <ul className="leading-9">
              <li>Django</li>
              <li>Flask</li>
              <li>FastAPI</li>
            </ul>
            <p className="mt-3">
              <b>Data Analysis 🔬</b>
            </p>
            <ul className="leading-9">
              <li>Pandas</li>
              <li>NumPy</li>
              <li>SCIKit</li>
            </ul>
            <p className="mt-3">
              <b>Automation 👩‍💻</b>
            </p>
            <ul className="leading-9">
              <li>Selenium</li>
              <li>BeautifulSoup</li>
            </ul>
            <p className="animate-bounce  mt-6">↓</p>
          </Section>
        </div>
      </Scroll>
    )
}