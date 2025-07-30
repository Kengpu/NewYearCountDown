// Three.js Imports (MUST be at the top level for modules)
import * as THREE from "three";
import { LineMaterial } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/lines/Line2.js";
import { LineGeometry } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/lines/LineGeometry.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/postprocessing/UnrealBloomPass.js";


// Three.js Background Animation Logic (formerly in three_background.js)
function initializeThreeJsBackground() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0); // Transparent black clear color

    document.getElementById('three-background-canvas').appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
    bloomPass.threshold = 0;
    bloomPass.strength = 1;
    bloomPass.radius = 0;
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    function getPositions() {
        const points = [];
        points.push(0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0); // face
        points.push(0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1); // face
        points.push(0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1); // the rest
        const arr = points.map(v => v -= 0.5);
        return arr;
    }
    function getBox(index) {
        const hue = 0.8 - index / 19;
        const material = new LineMaterial({
            color: new THREE.Color().setHSL(hue, 1.0, 0.5),
            linewidth: 9,
            transparent: true,
            opacity: 0.25,
            blendMode: THREE.AdditiveBlending,
        });
        material.resolution.set(w, h);

        const geometry = new LineGeometry();
        geometry.setPositions(getPositions());
        const mesh = new Line2(geometry, material);
        mesh.scale.setScalar(1.0 + index * 0.2); // This is where the scale was increased
        const rotationSpeed = 0.0005;
        const offset = 1.0 - index * 0.03;
        mesh.update = (t) => {
            mesh.rotation.x = Math.sin(offset + t * rotationSpeed) * 2;
            mesh.rotation.y = Math.sin(offset + t * rotationSpeed) * 2;
        }
        return mesh;
    }

    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    function addBoxes(numBoxes) {
        for (let i = 0; i < numBoxes; i += 1) {
            let box = getBox(i);
            boxGroup.add(box);
        }
    }
    addBoxes(16);
    boxGroup.update = (t) => {
        boxGroup.children.forEach((box) => {
            box.update(t);
        });
    }

    function animate(timeStamp) {
        timeStamp += 0.000001;
        requestAnimationFrame(animate);
        boxGroup.update(timeStamp);
        composer.render(scene, camera);
    }

    animate();

    function handleWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleWindowResize, false);
}


// Main Countdown Logic (existing animation.js content)
const dayInput = document.getElementById('day');
const hourInput = document.getElementById('hour');
const minuteInput = document.getElementById('minute');
const secondInput = document.getElementById('second');
const container = document.getElementById("container");
const titleElement = document.querySelector('h2');
const targetYearElement = document.getElementById('target-year');

// Determine the actual New Year's time (January 1st of the next year)
const currentYear = new Date().getFullYear();
const NewYearTime = new Date(currentYear + 1, 0, 1, 0, 0, 0).getTime();

// For testing animations, you can uncomment the line below and comment out the above NewYearTime line
// const NewYearTime = new Date().getTime() + 10000; // 5 seconds from now for quick testing

const jsConfetti = new JSConfetti();
let countdownInterval;

function Updatecountdown() {
    const now = new Date().getTime();
    let gap = NewYearTime - now;

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const addLeadingZero = (num) => {
        return num < 10 ? '0' + num : num;
    };

    if (gap <= 0) {
        // Countdown finished, show zeros and trigger celebrations
        clearInterval(countdownInterval); // Stop the main countdown updates

        dayInput.textContent = "00";
        hourInput.textContent = "00";
        minuteInput.textContent = "00";
        secondInput.textContent = "00";

        // Trigger the main container's drop-zoom animation
        container.classList.add('drop-zoom');

        // Listen for the end of the drop-zoom animation to trigger subsequent effects
        container.addEventListener('animationend', function handler() {
            // Remove drop-zoom class and add shake animation
            container.classList.remove('drop-zoom');
            container.classList.add('shake');

            // Add dark mode to body and main container
            document.body.classList.add('dark-mode');
            container.classList.add('dark-mode');

            // Add neon glow to title and year text
            titleElement.classList.add('neon-title');
            targetYearElement.classList.add('neon-year');

            //Add neon glow to each countdown box (including numbers and labels inside)
            const boxes = document.querySelectorAll(".dark-countdown-box");
            boxes.forEach(box => {
                box.classList.add("neon-border"); // Add the class to enable glow
            });

            // 5. Update the title and target year for "Happy New Year!"
            titleElement.textContent = 'Happy New Year!';
            targetYearElement.textContent = currentYear + 1; // Display the current year

            // Listen for the shake animation to end (once)
            container.addEventListener('animationend', () => {
                container.classList.remove('shake'); // Remove shake class after animation
            }, { once: true });

            // Remove this event listener after it runs once to prevent multiple triggers
            container.removeEventListener('animationend', handler);

            // Trigger Three.js background animation and make it visible
            initializeThreeJsBackground(); // Initialize and start Three.js animation
            document.getElementById('three-background-canvas').style.display = 'block'; // Show the Three.js canvas
            document.body.classList.add('three-bg-active'); // Add class to body for semi-transparent dark background

        }, { once: true }); // Ensure this animationend listener runs only once for drop-zoom

        // jsConfetti loop for 5 minutes
        let confettiCount = 0;
        const maxConfettiRuns = 300; // 5 minutes * 60 seconds/minute = 300 seconds (runs)
        const confettiIntervalDuration = 1000; // Every 1 second

        const confettiLoop = setInterval(() => {
            jsConfetti.addConfetti({
                emojis: ['🎉', '🥳', '✨', '🎆'], // Corrected emojis
                confettiNumber: 15, // Adjusted for a slightly denser burst
                emojiSize: 45, // Adjusted size
            });
            confettiCount++;
            if (confettiCount >= maxConfettiRuns) {
                clearInterval(confettiLoop); // Stop the confetti loop after 5 minutes
            }
        }, confettiIntervalDuration);

        return; // Exit the function to prevent further countdown calculations
    }

    // If countdown is still active, update numbers
    const dayOut = Math.floor(gap / day);
    const hourOut = Math.floor((gap % day) / hour);
    const minuteOut = Math.floor((gap % hour) / minute);
    const secondOut = Math.floor((gap % minute) / second);

    dayInput.innerHTML = addLeadingZero(dayOut);
    hourInput.innerHTML = addLeadingZero(hourOut);
    minuteInput.innerHTML = addLeadingZero(minuteOut);
    secondInput.innerHTML = addLeadingZero(secondOut);
}

const initialTargetYear = new Date().getFullYear() + 1;
document.getElementById('target-year').textContent = initialTargetYear;
Updatecountdown();

countdownInterval = setInterval(Updatecountdown, 1000);