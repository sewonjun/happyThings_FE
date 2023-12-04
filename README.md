<div style="display: flex; justify-content: center;">
  <img style="width: 500px; " alt="Happy Things Logo" src="src/assets/logo.svg">
</div>
</br>
<div style="text-align: center;">
  감정 추론을 통해 행복한 얼굴이 보이면 사진을 찍어주는 AI 기반 감정 추론 웹 어플리케이션
  <strong>Happy Things</strong>입니다
</div>
</br>

# 📒 Table of Contents

- [Preview](#🎬-Preview)
- [Introduction](#🙌-Introduction)
- [Challenges](#⚙️-Challenges)
- [Tech Stack](#🛠️-Tech-Stacks)
- [Features](#🪢-Features)

# 🎬 Preview

# 🙌 Introduction

Happy Things는 안면 인식을 통해 사람의 감정을 추론하여, 그 순간을 사진으로 제공해주는 웹 어플리케이션입니다. 자체 감정 추론 모델을 개발하여, 모델이 행복한 표정을 실시간으로 캡쳐하여, 사진으로 제공합니다. 제공받은 사진은 다운로드 기능을 제공합니다.

# ⚙️ Challenges

프로젝트를 진행하면서 어려웠던 챌린지는 크게 3가지가 있었습니다.

1. 자체 감정 추론 모델을 어떻게 만들것인가?
2. 실시간 스트리밍 환경에서 3가지 작업을 어떻게 병렬적으로 실행시킬 것인가?
3. 크로스 브라우징을 위한 safari 문제 해결 여정

## 1. 자체 감정 추론 모델을 어떻게 만들것인가?

### 1-1. 감정 추론 모델 개발 과정

머신러닝을 하기 위해서는 3가지 큰 단계가 있습니다.

- 과거 데이터 수집
- 데이터 전처리
- 데이터로 모델을 학습

가장 먼저 감정별로 구별되어 있는 <strong>과거 데이터를 수집</strong>해야 했습니다. 얼굴이 48x48픽셀 그레이스케일 이미지로 구성되어 있어 있는 데이터셋 [fer2013](https://www.kaggle.com/datasets/msambare/fer2013)을 이용하여 데이터 수집을 하였습니다. <br/>

.jpg로 되어 있는 데이터셋을 모델에 학습 시키기 위해서는 <strong>데이터 전처리</strong>가 필요했습니다. 이미지 얼굴 인식을 통해 안면 근육을 수치로 측정할 수 있는 [MediaPipe의 Face-landmark-detection 모델](https://mediapipe-studio.webapps.google.com/demo/face_landmarker)을 통해 3D로 인식한 안면 근육의 움직임 정도를 수치화 시킬 수 있었습니다.

```
[
    {
        "index": 25,
        "score": 0.845664918422699,
        "categoryName": "jawOpen",
        "displayName": ""
    },
    {
        "index": 4,
        "score": 0.48291221261024475,
        "categoryName": "browOuterUpLeft",
        "displayName": ""
    },
    {
        "index": 18,
        "score": 0.31452351808547974,
        "categoryName": "eyeLookUpRight",
        "displayName": ""
    },
    {
        "index": 17,
        "score": 0.29944589734077454,
        "categoryName": "eyeLookUpLeft",
        "displayName": ""
    },

    //...중략
]
```

<center><small>Mediapipe에서 제공하는 이미지 안면인식을 통한 52개의 안면 근육 값 예시</small></center>
<br/>
전처리된 데이터를 지도 학습으로 딥머신 러닝을 시키기 위해서는 label을 붙여줘야 했습니다. label은 해당 데이터가 행복한 이미지인지, 행복하지 않은 이미지인지 모델 학습시 구별할 수 있는 역할을 합니다. <br/>
<small style="padding:2px;">
<strong>지도 학습이란?</strong>
입력과 타깃을 전달하여 모델을 훈련한 다음 새로운 데이터를 예측하는 데 활용한다. k-최근접 이웃이 지도 학습 알고리즘이다.
</small>

```
//행복한 이미지 라벨링 =  1
1,
0.04288517311215401,0.09924527257680893,0.0024865891318768263,7.495935392398678e-7,0.0000015387073517558747,0.2613745927810669,0.1912066638469696,0.4886472225189209,0.254801481962204,0.004974926356226206,0.003475902369245887,0.011440315283834934,0.6184675693511963,0.6213760375976562

//행복하지 않은 이미지 라벨링 = 0
0,
0.0005167833296582103,0.00033727806294336915,0.47885823249816895,4.2532121824478963e-7,2.177084184040723e-7,0.008147920481860638,0.02306659333407879,0.038605958223342896,0.045772310346364975,0.031849455088377,0.04954182356595993,0.005695571657270193,0.0000036304211334936554,0.0000025047413600987056
```

위에 있는 데이터 예시처럼 행복한 이미지 데이터인 경우 1을 라벨링으로 붙이고, 행복하지 않은 이미지 데이터인 경우 0으로 데이터 라벨링을 해주었습니다.

<br/>

전처리된 데이터들을 학습 시킬 과정에서 tensorflow는 데이터를 모델에 학습 시키기 위해서는 tensor라는 데이터 포멧으로 모델을 학습 시킬 수 있다는 사실을 알게 되었습니다. 데이터 변환을 제공해주는 [Danfojs](https://danfo.jsdata.org/)를 통해 .csv파일을 tensor 데이터 포멧으로 변환하여 모델을 학습 시킬 수 있었습니다.
데이터 학습 결과, 약 <strong>80% 학습 정확도</strong>를 가진 감정 추론 모델을 개발할 수 있었습니다.

<img width="538" alt="모델_학습결과" width="70" height="350" src="https://github.com/sewonjun/happyThings_BE/assets/93499071/14955af2-0178-4d52-981d-ca1cc1f2e446">

### 1-2. 감정 추론 모델 추가 학습 과정

## 2. 실시간 스트리밍 환경에서 병렬적으로 3가지 작업을 어떻게 할 것인가?

실시간으로 얼굴이 스트리밍 되는 환경에서 실행되어야 할 3가지 작업이 있었습니다.

- Mediapipe를 통한 3D 얼굴 인식 및 얼굴 인식 마스크 씌우기
- 감정 추론 모델을 통한 감정 추론
- 감정 추론시, 행복한 얼굴일 시 사용자 얼굴 캡쳐

이 세가지 작업을 실시간 스트리밍 환경에서 병렬적으로 실행해야 했습니다. 병렬적으로 세가지 작업을 수행하기 위해서는 모든 작업이 하나의 프레임 안에서 다 끝나야 했습니다. 대부분의 현대 디스플레이는 초당 60프레임으로 갱신되므로, 대략 16ms 안에 세가지 작업이 모두 실행되어야 했습니다. 그래서 하나의 프레임 안에서 해결할 수 있는 코드 실행 시간 최적화를 중점으로 두고 작업하였습니다.

### 2.1 자연스러운 렌더링을 위한 방법: requestAnimationFrame vs setTimeout

실시간으로 세 가지 작업을 동시에 하기 위해서 선택할 수 있는 방법은 requestAnimationFrame, setTimeout 두가지가 있었습니다.</br>
rAF를 사용했을때, 약 16.7ms로 프레임이 규칙적으로 렌더링 되고 있고, setTimeout을 실행했을때는 약 16~50ms로 불규칙적으로 프레임 렌더링이 되었습니다.

<center>requestAnimationFrame</center>

```javascript
  async function predictWebcam() {
    //...
    let startTimeMs = performance.now();
    const results = await faceLandmarker.detectForVideo(video, startTimeMs);
    //...
    if (!lastTime.current || currentTime - lastTime.current >= delay) {
      lastTime.current = currentTime;
      //...
      if (webcamRunning) {
      //requestAnimationFrame 사용
      //브라우저가 리페인트될 준비가 끝나면 콜백 함수 실행
        const animationFrameId = window.requestAnimationFrame(predictWebcam);
        setAnimationId(animationFrameId);
      }
    } else {
      if (webcamRunning) {
        const animationFrameId = window.requestAnimationFrame(predictWebcam);
        setAnimationId(animationFrameId);
      }
    }
```

<center>setTimeout</center>

```javascript
async function predictWebcam() {
  //...
  let startTimeMs = performance.now();
  const results = await faceLandmarker.detectForVideo(video, startTimeMs);
  //...
  if (!lastTime.current || currentTime - lastTime.current >= delay) {
    lastTime.current = currentTime;
    //...
    if (webcamRunning) {
      //setTimeout을 이용
      // 16ms 지연 후 실행
      const timeoutId = setTimeout(predictWebcam, 16);
      setAnimationId(timeoutId);
    }
  } else {
    if (webcamRunning) {
      const timeoutId = setTimeout(predictWebcam, 16);
      setAnimationId(timeoutId);
    }
  }
}
```

requestAnimationFrame을 사용했을때, 프레임 렌더링 주기</br>
<img width="584" height="300" alt="image" src="https://github.com/sewonjun/happyThings_FE/assets/93499071/17d46a5b-99d6-4478-8f9a-36e9b0e65d11">

setTimeout을 사용했을때, 프레임 렌더링 주기</br>
<img width="584" height="300" alt="image" src="https://github.com/sewonjun/happyThings_FE/assets/93499071/4ca35044-198d-4946-9b91-ca89c61c6d19">

이는 requestAnimationFrame과 setTimeout의 동작 차이에서 일어나는 현상이라는 사실을 알게 되었습니다.

|         방법          | <center>특징<center>                                                                                                                                                                                                                                                          |
| :-------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| requestAnimationFrame | - 다양한 디바이스에서 해당 브라우저의 리페인트 주기에 맞게 콜백을 예약한다. </br> - 사용자의 디바이스 성능과 배터리 수명을 고려한다 </br> - 브라우저가 비활성화 되면 콜백이 중단된다. (리소스 절약)                                                                           |
|      setTimeout       | - 정해진 시간 간격으로 실행. => 브라우저 렌더링 주기와 동기화 되지 않는다. </br> - 브라우저 활성 여부와 상관없이 지정된 시간 간격대로 실행이 된다. (리소스 낭비) </br> - 다른 작업 수행으로 콜백 함수 실행이 지연되면, 프레임 드랍이 일어나고, 이는 화면 버벅거림을 초래한다. |

<br/>
requestAnimationFrame은 브라우저 프레임 렌더링 주기에 맞춰 콜백을 예약하고, 리소스 절약을 할 수 있습니다. 무엇보다 다양한 디바이스에서 작동이 가능해야 하는 프로젝트 특성상, 브라우저에 맞춰 콜백을 예약한다는 점에서 requestAnimationFrame이 setTimeout보다 이 프로젝트에 적합하다고 판단하였습니다.

### 2.2 timestamp를 사용하여 프레임 캡쳐하기

requestAnimationFrame을 통해 얼굴 인식 및 감정 추론을 브라우저의 프레임에 맞춰 실행할 수 있었습니다. 하지만, 사용자 얼굴을 캡쳐해주는데서 다른 문제가 발생했습니다. 모든 프레임에서 캡쳐를 진행하니 프레임 렌더링 주기가 15-20ms에서 15-33ms로 길어졌습니다. 이는 프레임 렌더링 주기의 불규칙성을 가져오고, 결국 얼굴 인식이 부드럽지 않게 이루어지는 결과를 초래했습니다.

이런 상황을 방지하기 위해 일정한 시간 간격을 두고 캡쳐를 하는 방법에 대해 고민해보았습니다. 일정 시간 간격을 두기 위해서 requestAnimationFrame에서는 performance.now를 사용하였습니다. performance.now()는 이전 프레임과 현재 프레임의 시간차를 정확하게 기록하여 일정 시간이 지난후에, capture 로직이 작동하도록 timestamp를 도입하였습니다.

```javascript
const currentTime = performance.now();
const delay = 500;

//currentTime - lastTime이 delay만큼 되었을때, 캡쳐 진행
if (!lastTime.current || currentTime - lastTime.current >= delay) {
  lastTime.current = currentTime;

  // 캡쳐 로직
  if (webcamRunning) {
    const animationFrameId = window.requestAnimationFrame(predictWebcam);
    setAnimationId(animationFrameId);
  }
} else {
  if (webcamRunning) {
    const animationFrameId = window.requestAnimationFrame(predictWebcam);
    setAnimationId(animationFrameId);
  }
}
```

> [!NOTE]
> 프레임 탭에 노란색 빗금이 쳐저있는 영역은 프레임이 그려지지 않았다는 표시이다.<br/>

timestamp를 사용하지 않아서 프레임 드랍이 일어남<br/>
<img width="453" alt="image" src="https://github.com/sewonjun/happyThings_FE/assets/93499071/5efeae3a-cea0-42ef-a4b9-4f23a151549e">

timestamp를 사용하여 프레임 드랍이 생기지 않음<br/>
<img width="464" alt="image" src="https://github.com/sewonjun/happyThings_FE/assets/93499071/77490391-207b-4d1d-85b2-d4dbe1153149">

## 3. 크로스 브라우징을 위한 safari 문제 해결 여정

### 3-1. safari에서의 카메라 접근 권한 오류

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

# 🛠️ Tech Stacks

## Frontend

<!-- React -->
<img src= "https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=black">
<!-- TailWind -->
<img src= "https://img.shields.io/badge/TailWind-06B6D4?style=for-the-badge&logo=Tailwind CSS&logoColor=black">
<!-- Tensorflow -->
<img src= "https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=TensorFlow&logoColor=black">
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

```

```
