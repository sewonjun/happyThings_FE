# happythings fe

<div style="display: flex; justify-content: center;">
  <img style="width: 500px; " alt="Happy Things Logo" src="src/assets/logo.svg">
</div>
<div style="text-align: center;">
  감정 추론을 통해 행복한 얼굴이 보이면 사진을 찍어주는 AI 기반 감정 추론 웹 어플리케이션 </br>
  <strong>Happy Things</strong>입니다
</div>
</br>

# 📒 Table of Contents

- [Preview](#🎬-Preview) <br/>
- [Introduction](#🙌-Introduction)
- [Challenges](#⚙️-Challenges)
- [Tech Stack](#🛠️-Tech-Stacks)
- [Features](#🪢-Features)

# 🎬 Preview

# 🙌 Introduction

## Motivation

살면서 우리는 즐거운 소식을 전하거나, 선물을 전하는 순간을 마주합니다. 그 순간에 즐거운 표정을 포착해서 사진으로 남기면 좋지 않을까 해서 시작한 프로젝트입니다. Happy Things는 안면 인식을 통해 사람의 감정을 추론하여, 그 순간을 사진으로 캡쳐해주는 웹 어플리세이션입니다. 감정 추론을 목표로 하였지만 감정은 안면으로만 인식되는 것은 아니므로 사실상 행복한 표정을 라이브 비디오 상황에서 포착하는 것을 목적으로 만들어졌습니다.

## Schedule

프로젝트 기간: **2023.08.07 ~ 2023.09.07** /

<details close>
  <summary>1주차 일정</summary>
  <li> 아이디어 수집 </li>
  <li> 레퍼런스 수집</li>
  <li> Figma를 사용한 Mockup 제작 </li>
  <li> Notion을 사용한 칸반 작성 </li>
</details>

<br/>

<details close>
  <summary>2주차 ~ 3주차 일정</summary>
  <li> husky, eslint, lint-staged를 사용한 초기 설정 </li>
  <li> 프론트엔드, 백엔드 보일러 플레이트 초기 설정 </li>
  <li> Mediapipe Facelandmark detection 적용시키기 </li>
  <li> 백엔드 기능 구현 </li>
  <li> 프론트엔드 기능 구현 </li>
  <li> 발표 준비 </li>
</details>

<br/>

# ⚙️ Challenges

프로젝트를 진행하면서 어려웠던 챌린지는 크게 3가지가 있었다.

- 안면 인식을 통한 감정 추론 모델을 어떻게 만들것인가?
- 행복한 표정을 어떻게 사진으로 사용자들에게 보여줄 것인가?
- 모바일로 카메라 접근이 가능하게 할 수 있게 하기 위한 방법이 무엇이 있는가?

## 안면 인식을 통한 감정 추론 모델을 어떻게 만들것인가?

### 1. 안면 인식을 어떻게 할 것인가?

감정 추론 모델을 만들기 위해서는 가장 먼저 표정을 추론할 수 있는 안면 인식이 가능해야 했다.

javascript로 안면인식을 하기 위해서는 3가지 방법을 찾았다.

| 방법                                   | 특징                                                                                                                                                                                                                              | 장점                                                                                                                                               | 단점                                                                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| tensorflow.js face-landmarks-detection | - 안면인식에 따른 468개의 얼굴 각 포인트들의 좌표값을 받을 수 있다. <br/> - 브라우저에서 직접 실행되는 js 라이브러리이다.                                                                                                         | - 서버없이 클라이언트 측에서 실시간 얼굴 랜드마크 감지가 가능하다.                                                                                 | - 브라우저와 하드웨이의 성능에 크게 의존한다.<br/> - 무거운 머신 러닝 모델을 실행하기 때문에 느릴 수 있다. <br/> - 특히 모바일에서 느릴 수 있다. |
| Mediapipe face landmark detection      | - face mesh로 안면 인식을 마스크로 시각적으로 보여줄 수 있다. <br/> - blendshape prediction model을 통해 얼굴의 다양한 표정을 나타내는 계수인 52개의 blendshape 점수를 받을 수 있다 <br/> - 크로스 플랫폼 프레임워크 <br/> - wasm | - 다양한 플렛폼에서의 빠른 성능과 높은 정확도, GPU 가속화를 통한 실시간 처리 능력이 특징이다. <br/> - 모바일 웹의 경우 MediaPipe를 선호할 수 있다. | - 웹 기반 어플리케이션에서의 사용은 별도의 서버나 API가 필요할 수 있다.                                                                          |

tensorflow.js에 있는 face-landmarks-detection은 468개의 얼굴 포인트 값만 받을 수 있는데에 반해, Mediapipe에 있는 Face landmark detection은 face mesh를 통해 얼굴인식 마스크를 씌울 수 있는 것뿐만이 아니라 Blendshape prediction model을 통해 face mesh 모델로부터 출력을 받아 얼굴의 다양한 표정을 나타내는 계수인 52개의 blendshape 점수를 받을 수 있다.

각 얼굴 부분의 0 - 1 사이의 수치를 나타내는 값을 받을 수 있는 mediapipe를 선택하기로 했다. mediapipe가 나타내는 52개의 값들은 아래와 같다.

| blendshapes           |                          |
| --------------------- | ------------------------ |
| 1 - browDownLeft      | 27 - mouthClose          |
| 2 - browDownRight     | 28 - mouthDimpleLeft     |
| 3 - browInnerUp       | 29 - mouthDimpleRight    |
| 4 - browOuterUpLeft   | 30 - mouthFrownLeft      |
| 5 - browOuterUpRight  | 31 - mouthFrownRight     |
| 6 - cheekPuff         | 32 - mouthFunnel         |
| 7 - cheekSquintLeft   | 33 - mouthLeft           |
| 8 - cheekSquintRight  | 34 - mouthLowerDownLeft  |
| 9 - eyeBlinkLeft      | 35 - mouthLowerDownRight |
| 10 - eyeBlinkRight    | 36 - mouthPressLeft      |
| 11 - eyeLookDownLeft  | 37 - mouthPressRight     |
| 12 - eyeLookDownRight | 38 - mouthPucker         |
| 13 - eyeLookInLeft    | 39 - mouthRight          |
| 14 - eyeLookInRight   | 40 - mouthRollLower      |
| 15 - eyeLookOutLeft   | 41 - mouthRollUpper      |
| 16 - eyeLookOutRight  | 42 - mouthShrugLower     |
| 17 - eyeLookUpLeft    | 43 - mouthShrugUpper     |
| 18 - eyeLookUpRight   | 44 - mouthSmileLeft      |
| 19 - eyeSquintLeft    | 45 - mouthSmileRight     |
| 20 - eyeSquintRight   | 46 - mouthStretchLeft    |
| 21 - eyeWideLeft      | 47 -mouthStretchRight    |
| 22 - eyeWideRight     | 48 - mouthUpperUpLeft    |
| 23 - jawForward       | 49 -mouthUpperUpRight    |
| 24 - jawLeft          | 50 - noseSneerLeft       |
| 25 - jawOpen          | 51 - noseSneerRight      |
| 26 - jawRight         | 52 - tongueOut           |

### 2. 모델을 어떻게 만들것인가?

머신러닝의 과정은 크게 3가지로 나뉜다. 과거 데이터 모으기, 데이터 전처리하기, 모델 학습 시키기.

가장 먼저 tensorflow.js를 감정 추론을 시키기 위해 표정 관련 **데이터**가 필요했다. 표정 데이터로 가장 유명한 [fer2013](https://www.kaggle.com/datasets/deadskull7/fer2013)를 사용하였다. 데이터셋에서 행복한 표정 데이터와 그와 반대된다고 판단되는 화난 표정, 슬픈 표정 데이터를 찾아 학습을 시키기로 하였다. 여러 데이터 유형들이 있었고, buffer로 된 이미지 데이터보다는 직접 이미지를 찾아 face mesh mask를 씌워 face blendshape 값을 도출할뒤, 그 값들을 통해 모델을 학습 시키는 것을 택했다.

이미지를 face mesh mask를 씌운 후 json 파일로 결과값들을 저장했다. 이후, 머신러닝 학습에 용이한 데이터셋으로 만들기 위해 csv 파일로 필요한 데이터 형식을 바꾸는 과정을 거쳤다.

csv 파일로 변환시, **뒤센의 미소**에 따른 표정에 유의미한 결과를 내는 데이터들만 골라서 변환을 진행했다.

여기서 뒤센의 미소란, 진짜 미소를 지을때 나타나는 안면 근육의 변화에 관한 이론이다. 이 이론에 따르면 안륜근, 즉 눈 주위에 있는 근육과 광대(대협골근)에 있는 근육이 행복한 미소에 영향을 받는 근육이라고 한다.

그렇게 선별된 faceblendshape 데이터는 총 14개이다.

- browDownLeft :
- browDownRight
- browInnerUp
- cheekSquintLeft
- cheekSquintRight
- eyeBlinkRight
- eyeBlinkLeft

- eyeSquintRight
- eyeSquintLeft
- eyeWideLeft
- eyeWideRight
- jawOpen
- mouthSmileLeft
- mouthSmileRight

선별된 14개의 face blendshape 값들을 **독립변수**로 넣고, 행복한 이미지인 경우 0을 **매개변수**로, 행복하지 않은 이미지인 경우 1을 **매개변수로** 설정하여 지도 학습으로 tensorflow.js를 통해 모델을 핏 시켰다.

|          상태          | 독립변수                                                                                                                                                                                                                                                                                                                                                                                | 종속변수 |
| :--------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
|   행복한 얼굴 이미지   | 0.0016164835542440414 <br/> 0.0020071598701179028 <br/> 0.27183035016059875 <br/> 1.785326873005033e-7 <br/> 1.4324434971513256e-7 <br/> 0.15129753947257996 <br/> 0.1709703505039215 <br/> 0.2576271593570709 <br/> 0.35123521089553833 <br/> 0.0072589656338095665 <br/> 0.00355226406827569 <br/> 0.007774457335472107 <br/> 0.0000034541039894975256 <br/> 0.0000023912402866699267 |    1     |
| 화난, 슬픈 얼굴 이미지 | 0.00161648 35542440414 <br/>0.0020071598701179028 <br/>0.27183035016059875 <br/>1.785326873005033e-7<br/>1.4324434971513256e-7 <br/>0.15129753947257996 <br/>0.1709703505039215 <br/>0.2576271593570709 <br/>0.35123521089553833 <br/>0.0072589656338095665 <br/>0.00355226406827569 <br/>0.007774457335472107 <br/>0.0000034541039894975256 <br/>0.0000023912402866699267              |    0     |

실시간으로 얼굴 인식 후 감정 추론 모델을 구동시키면 아래와 같은 값이 나온다. 왼쪽 값은 unhappy 값을 나타내고, 왼쪽 값은 happy 값을 나타낸다.

```jsx

predictHappiness.js:37 predictHappiness [[0.0663047581911087,0.9336951971054077]]
// 0번 인덱스에 있는 값이 unhappy 수치, 1번 인덱스가 happy 수치를 가리킨다.
```

## 모바일 카메라 접근이 왜 안될까?

Happy things는 일상의 기쁨을 포착해주는 웹 어플리케이션이다. 일상에서 많이 사용하는 것은 노트북이 아닌 핸드폰이므로, 핸드폰에서도 구동이 가능해야 한다고 생각 했다. 그래서 모바일 구동을 하기 위해 핸드폰에서 구동을 시도했고, 모바일 카메라가 켜지지 않는다는 사실을 알게 되었다.

### 1. 모바일 카메라 접근을 얻기 위한 방법은?

모바일 상에서는 Web API인 `MediaDevices.getUserMedia()`를 통해 미디어 입력 사용 권한을 사용자에게 요청하여 요청된 유형의 미디어를 포함하는 트랙을 생성하는 MediaStream을 생성한다.

```jsx
const constraints = {
  video: true,
};

navigator.mediaDevices.getUserMedia(constraints).then(stream => {
  videoRef.current.srcObject = stream;
  videoRef.current.addEventListener("loadeddata", predictWebcam);
});
```

`getUserMedia()` 호출은 권한 요청을 트리거하고, 실시간 스트리밍 비디오를 구동 시킬수 있게 만든다.

### 2. 모바일 환경에서 전체 화면으로 비디오가 재생되는 문제

```jsx
<video
  ref={videoRef}
  width="480"
  height="360"
  autoPlay
  playsinline
  className="w-full h-[360px] bg-white border-8 border-stone-800"
></video>
```

모바일 환경에서 video가 전체 화면으로 커지면서 face mesh mask가 씌워지지 않는 문제가 생겼다. 이는 ios의 문제라는 사실을 알게 되었다. webkit에서 발표한 **[New <video> Policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/)**을 통해, 과거의 ios에서의 video 태그에 대한 변화를 알게 되었다. 여러 블로그 글에서 video 태그의 재생을 위해서는 사용자 제스처, 즉 eventListener의 동작이 필요하다고 적혀있었다. 하지만 New <video> Policies for iOS에서 명시하길 ios10이후로 무음 video 요소에 대한 유저 제스처 요구 사항이 완화되었다고 한다. 또한, playsinline 속성을 통해 인라인으로 재생할 수 있으며, 재생이 시작될 때 자동으로 전체화면 모드로 들어가지 않는다.

## 행복한 순간을 캡쳐할 수 있는 방법은?

```jsx
const capture = captureRef.current;
capture?.setAttribute("class", "canvas");
capture?.setAttribute("width", videoRect.width);
capture?.setAttribute("height", videoRect.height);
capture.style.left = videoRect.x;
capture.style.top = videoRect.y;
capture.style.width = videoRect.width;
capture.style.height = videoRect.height;
let captureCtx = captureRef.current.getContext("2d");
captureCtx.clearRect(0, 0, canvas.width, canvas.height);
captureCtx.drawImage(
  videoRef.current,
  0,
  0,
  videoRef.current.width,
  videoRef.current.height
);
//현재 face-mesh mask가 씌워진 video 태그 위에 다른 canvas를 하나 더 만들어서 캡쳐함.
const capturedPicture = captureRef.current.toDataURL("image/png");
//dataUrl로 반환된다.
```

이미 face-mesh 마스크를 띄우고 있는 canvas보다 먼저 또 다른 canvas를 만들어 현재 사진을 캡쳐하는 방식을 택함.

# 🛠️ Tech Stacks

## Frontend

<!-- React -->
<img src= "https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black">
<!-- TailWind -->
<img src= "https://img.shields.io/badge/TailWind-06B6D4?style=for-the-badge&logo=Tailwind CSS&logoColor=black">
<!-- Tensorflow -->

<br/>

## Backend

<!-- Express -->
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=Express&logoColor=white"/>
<!-- MongoDB & Mongoose -->
<img src="https://img.shields.io/badge/MongoDB&Mongoose-47A248?style=for-the-badge&logo=MongoDB&logoColor=white"/>
<!-- Node Js -->
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white"/>
<br/>
<br/>

# 🪢 Features
