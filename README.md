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

개발을 진행하면서 어려움을 겪었던 부분들을 공유합니다.

## 감정 추론 모델 만들기

머신러닝을 처음 하는 사람으로써 tensorflow.js에 어떤 값들을 넣어야 하는지 몰랐다. 머시러닝의 플로우가 과거의 데이터를 준비하고, 모델에 들어갈 데이터를 전처리하고, 그 전처리된 데이터를 핏(fit) 시키는 과정이라는 사실을 알기까지 시간이 오래 걸렸다. 또한, 데이터 전처리 과정에서 처음 적용하는 csv 파일도 json으로 변환하는데 꽤 어려움을 겪었다.

## requestAnimationFrame

감정 추론 모델을 통해 감정이 추론됐을때, happy이면 캡쳐를 해줘야 한다. 일단 Facemask가 얼굴을 계속해서 따라다니면서 감지를 하기 위해서는 requestAnimationFrame을 통해 1초에 60번이 넘는 호출을 감정 추론과 함께 해야 했다. 이렇게 되면, 감정을 추론할 수 있는 시간이 너무 짧을 뿐만 아니라 캡쳐를 하기 용이하지 않아서 cancelAnimationFrame을 시도해보았다. 이는 facemask가 끊기게 나왔기 떄문애 방법이 아니였다. 이에 timestamp를 찍는 방법으로 우회해서 facemask는 계속 구동되더라도, timestamp상 500ms가 지나지 않으면, 감정 추론등 부과적인 함수들을 동작시키지 않는 방식으로 진행했다.

## 모바일 웹의 접근성

모바일 웹의 카메라 접근을 받는 방법은 생각보다 까다로웠다. 일단 아이폰의 경우 https만 카메라 접근이 가능했다. 또한, 카메라 접근을 받기 위한 event가 무조건 있어야 했다.
카메라 뿐만 아니라, video도 많은 에러사항이 있었다. video 태그를 모바일 웹에서 구동시키면, autoplay인 경우 카메라가 전체화면으로 들어가서 웹이 보이지 않고, 카메라만 보이는 상황이 생겼다. 리서치를 한 결과 plaseinline이라는 속성과 muted를 넣으면 전체화면으로 가지 않는다는 말을 듣고, 도전해보았다. 하지만 이는 렌더링 시점에 문제가 생기는지, 계속해서 video태그가 늦게 열리면서 facemask가 안되는 상황이 일어났다.
이에 여러방법을 도전하던 중 muted 속성을 뺴면, 정상적으로 동작하는 것을 확인했다.

## tfjs tensorflow.js의 npm 설치 문제

face landmark detection을 사용하기 위해서는 같이 설치해야 하는 부가적인 dependencies가 많았다. 그런데, 공식 문서에 따른 항목들을 설치하던 와중, 각 라이브러리들이 서로 충돌을 일으키는 이슈가 생겼다.
https://github.com/tensorflow/tfjs/issues/7905 공식 깃헙 이슈에서 문제가 있음을 인식했다고 했다.

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
