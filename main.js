// Functions--------------------------------------------------------------------
// Characters object initialize
function Character(name) {
  this.name = name; // name
  this.state = 1;   // 0-dead, 1-alive
  this.arrest = 0;  // 0-no, 1-murder1, 2-murder2, 3-both
}

// 인물 별 상황 업뎃
Character.prototype.StateUpdate = function(inputs) {
  
  // 체포 / 죽음
  this.state = 1*(this.name != inputs.died);   // 0-dead, 1-alive
  this.arrest = 1*(this.name == inputs.murder1) + 2*(this.name == inputs.murder2); // 0-no, 1-murder1, 2-murder2, 3-both
  
  // 추가 목표
  if (this.name == "참새") {
    if(inputs.code_seo == "rhtmxm0512") { this.coin = true } else { this.coin = false };
    if(this.arrest != 0) { this.who = ["강의식","박문","둘 다"][(this.arrest - 1)] };
  }
  if (this.name == "해님") {
    if (inputs.code_lee == "rhtmxm0512") { this.coin = true } else { this.coin = false };
  }
  if (this.name == "류영") {
    if(inputs.ident == "예") { this.ident = true } else { this.ident = false};
  }
  
}

// 인물 별 점수 계산
/*  [[목표]]
** 류영 빼고 모두 죽으면 0점. 류영은 본인이 강의식 살인범으로 지목되면 0점
참새:
	- 비트코인 찾기 (10점)
	- 강의식 살인범 찾기 (5점)
	- 박문 살인범 찾기 (5점)

해님: 
	- 강의식 살인범인걸 들키면 안 됨 (10점)
	- 박문 살인범 찾기기 (5점)
	- 비트코인 찾기 (5점)	

박승찬:
	- 김한달 죽인 범인인 걸 들키면 안 됨 (10점)
	- 강의식 살인범 찾기 (10점)

류영: 
	- 본인 살인범 죽이기 (10점)  //[ ] : 죽이기 10점? 체포만 해도 10점??
	- 죽은 강의식이라는 걸 들키면 안 됨 (5점) // 엉뚱한 사람 죽이면 -점수??
	- 박문 살인범 찾기 (5점)
*/

Character.prototype.GetScore = function(inputs) {
  
  const true_m1 = (inputs.murder1 == "해님")
  const true_m2 = (inputs.murder2 == "박승찬")
  const ghost_revenge = (inputs.died == "해님")
	const ghost_ending = (inputs.murder1 == "류영") // 류영이 강의식 살인범으로 몰렸을 때
  // const ghost_ascend = (inputs.died == "류영" &&  true_m1) //성불 시?
  
  // 점수 계산
  if (this.name == "참새") {
    this.score = (10 * this.coin + 5 * true_m1 + 5 * true_m2) * this.state
  }
  if (this.name == "해님") {
    this.score = (10 * (!true_m1) + 5 * true_m2 + 5 * this.coin) * this.state
  }
  if (this.name == "박승찬") {
    this.score = (10 * (!true_m2) + 10 * true_m1) * this.state
  }
  if (this.name == "류영") {
    this.score = (10 * ghost_revenge + 5 * (!this.ident) + 5 * true_m2) * (!ghost_ending)
    // this.score = 10 * ghost_revenge + 5 * (!this.ident) + 5 * true_m2
  }
	  
}

// 인물 별 은/는/이/가
function CharSfx(name, mode=0) {
  selector1 = ["는","가","를","와"]
  selector2 = ["은","이","을","과"]
  if(name == "참새"){
    out = name + selector1[mode]
  } else {
    out = name + selector2[mode]
  }
  return out
}

// 체포되는 사람
function WhoIsArrested(murder1, murder2, died) {
  if(murder1 == murder2) {
    arrested = [murder1];
  } else {
    arrested = [murder1, murder2];
  }
  // if(arrested.every(value => [died, "박문"].includes(value))) {
  //   // ???? 모두 죽은 경우....
  // }
  arrested = arrested.filter((element) => (element !== died) && (element !== "박문"));
  
  // 류영은 체포 ㄴㄴ 그냥 사라짐
  if (murder2=="류영"){
    arrested = arrested.filter((element) => element !== "류영");
  }
  
  // 스크립트에서 쓸 말
  if (arrested.length == 2) {
    // 두 명일 때
    sentence = CharSfx(arrested[0], 3) + " " + CharSfx(arrested[1], 2)
  } else if (arrested.length == 1) {
    // 한 명일 때
    sentence = CharSfx(arrested[0], 2)
  } else {
    // 없을 때.....
    sentence = null
  }
  
  out = {
    ls: arrested,
    who: sentence
  }
  
  return out
}

// 남은 산 사람 수
function HowManyLeft(alive, died) {
  
  remain = alive.filter((element) => (element !== died) )
  // remain = alive.filter((element) => (element !== died) && !arrested_list.includes(element))
  if (remain.length == 3) {
    count = ["세 분","셋","세"]
  } else if (remain.length == 2) {
    count = ["두 분","둘","두"]
  } else if (remain.length == 1) {
    count = ["한 분","하나","한"]
  }
  
  return count
}

// Inputs
function GetInputs() {
  inputs = {}
  document.getElementsByName("mur1").forEach((node) => {if(node.checked) {inputs.murder1 = node.value}});
  document.getElementsByName("mur2").forEach((node) => {if(node.checked) {inputs.murder2 = node.value}});
  document.getElementsByName("dead").forEach((node) => {if(node.checked) {inputs.died = node.value}});
  inputs.code_lee = document.getElementById("lee_coin").value;
  inputs.code_seo = document.getElementById("seo_coin").value;
  document.getElementsByName("ryu_ident").forEach((node) => {if(node.checked) {inputs.ident = node.value}});
  
  return inputs
}

//-----------------------------------------------------------------------------------

// 상황 별 단락
function ScriptComponents(inputs) {
  
  // 누가 뭘 했나 (스크립트 위해)
  // 죽은 사람
  died_who = CharSfx(inputs.died, 1)
  
  // 체포되는 사람
  arrested = WhoIsArrested(inputs.murder1, inputs.murder2, inputs.died)
  const arrested_list = arrested.ls
  const arrested_who = arrested.who
  
  // 신고하는 사람
  let callers = ["참새", "류영", "누군가"];
  callers = callers.filter((element) => (![inputs.murder1, inputs.murder2, inputs.died].includes(element)));
  const caller = callers[0];
  
  // 생존자
  let alive = ['해님', '박승찬', '참새'];
  
  // 남은 사람 수
  alive_count = HowManyLeft(alive, inputs.died, arrested_list)
  
  
  //---------------------------------------------------------------------------
  // 상황별 script.js 
  var script = {
    // 사람이 죽었다!
    dead: {
      ryu: `
      정신을 차려보니, 류영이 보이지 않았다. 자리에 있었던 흔적조차 없었다.
      `, // TODO  류영이 스스로 소멸을 택했을 경우 꼼꼼하게 확인
      other: `
      정신을 차려보니, ${died_who} 쓰러져 있었다. 다가가 흔들어 보지만, 이미 심장은 멈춰있었다.
      `
    },
    
    inter_call: `
    조금 뒤, 딸깍 하는 소리와 함께 잠겨있던 현관문이 열렸다. 계속 잡히지 않던 전화 신호도 돌아왔다.	
    ${caller}의 신고로 구급차가 오고, 뒤따라 경찰들도 왔다. 또 이 저택에 출동했다는 것을 믿을 수 없다는 표정들이었다.
    `,
    
    // 체포 상황
    inter_arrest: {
      yes: `
      각자의 이야기를 듣던 경찰은 ${arrested_who} 긴급 체포하였다.
      `,
      all_dead: `
      각자의 이야기를 듣던 경찰은 머리를 긁적이더니 일단 모두들 경찰서로 가야 할 테니 잠깐 기다리라고 했다.
      `
    },
    
    arrest: {
      park: {
        m1: `
        박승찬은 다급하게 다른 사람들을 가리키며 목소리를 높였다. 이렇게 허무하게 갈 수는 없다. "아니 잠깐, 의식이를 죽인 건 내가 아니야! 우리 친척 조카인데 내가 왜 죽여? 진범은 여기에 따로 있는 거라고!"
        `,
        m2: `
        박승찬은 저항하지 않고 땅을 내려다보며 낮게 중얼거렸다. "아니 김한달이 칼 들고 달려드길래 나도 모르게 그만..." <br><br>
        
        그는 한 숨 쉬었다. 경위야 어찌되었건 살인을 한 지금 더 이상 경찰이라는 자부심을 가질 수는 없었다. "뭐... 어차피 이 집에서 나가는대로 자수하려고 했어."
        `,
        m3: `
        그는 불현 생각난 듯 다른 사람들을 돌아 가리키며 목소리를 높였다. "하지만 의식이를 죽인 건 내가 아니야! 우리 친척 조카를 내가 왜 죽여? 진범은 여기에 따로 있는 거라고!"
        `
      },
      lee: {
        m1: `
        해님은 다리에 힘이 풀린 듯 털썩 주저 앉더니, 이내 체념한 듯 말했다. "그래. 강의식 내가 죽였어. 하지만 처음부터 죽일 생각은 없었어! 도망가려고 하지만 않았어도 살려뒀을거라고! 돈도 많으면서! 그깟 몇 푼 잃는게 뭐 대수라고..."
        `,
        m2: `
        해님은 다리에 힘이 풀린 듯, 주저 앉았다. 다른 사람도 아니고 김한달을 죽인 범인으로 몰리다니 아이러니했다. "나는 김한달을 죽이지 않았어! 이건 진범이 나한테 뒤집어 씌우는 거라고! 나는 아니야!"
        `,
        m3: `
        경찰들이 그녀를 일으켜 세우려고 했지만 그녀는 완강히 거부했다. 강의식은 그렇다 쳐도 억울한 누명을 쓸 수는 없었다. "그리고 김한달을 죽인 건 내가 아니야! 진범이 나한테 뒤집어 씌우는 거라고!"
        `
      },
      seo: `
      참새는 어안이 벙벙한 듯 아무 말도 못하고 서 있다가, 갑자기 몸을 비틀며 저항하기 시작했다. 하지만 체격있는 경찰들 앞에서는 역부족이었다. "아니야," 그녀는 외쳤다. "나는 아니라고! ${seo.who} 내가 죽인 거 아니란 말이야!" 이렇게 돈 때문에 인생이 망가지는구나 생각하니 눈 앞이 캄캄해졌다. 결백을 증명할 수 있을 만한 방법도 당장 딱히 생각나지 않았다.
      `
    },
    
    inter_arrest2: "<br><br>[[ 체포해야될 사람들이 모두 죽은 경우를 위해 스크립트 추가 ]]",  // TODO: 여기에 뭐 추가??
  
    // 코인 찾았는가
    inter_coin: `
    남은 조사를 위해 경찰들이 드나들고 부산스러운 와중에
    `,
    
    coin: {
      lee: {
        arrested: `
        해님은 숨죽인 채 속으로 짜릿한 비명을 몇번이고 내지르고 있었다. 강의식은 그녀의 생각보다도 더 많은 코인을 가지고 있었다.
        `,
        free: `
        [[[[TODO: 체포 X 버전]]]]
        `,
        sus: `
        '그러고보니 나말고 로그인 했던 사람은 누구지?' 문득, 비트코인 거래소 로그에 남아있던 로그인 시도 흔적을 떠올랐다. 어렵게 잡은 기회인데 한 푼도 뺏길 수는 없다. '누군지는 몰라도... 내가 먼저 환금해야만 해.' <br><br> 한편, 
        `
      },
      seo: {
        arrested: `
        참새는 '난 범인이 아니지만, 설령 감옥에 가더라도 출소만 하고 나면 빚도 갚을 수 있고...' 수갑을 찬채 끌려가면서도, 참새는 오히려 마음이 가벼웠다.
        `, // TODO 여기 더 부드럽게
        free: `
        참새는 불안한 듯 혼자 손톱 끝을 매만졌다. 자신에게 호의적으로 대해줬던 강의식에 대한 죄책감도 있었지만 한편으로는 이 돈으로 빚도 갚고 편하게 살 수 있을 거라는 생각에 빨리 집에 가서 액수를 제대로 확인하고 싶은 마음이 더 컸다.
        <br><br>
        '의식아, 미안해,' 그녀는 속으로 생각했다. '그렇지만... 어차피 이대로 두면 없어지는 돈이잖아. 너무 나쁘게만 생각하진 말아줘.'
        `,
        sus: `
        문득 그녀는 로그인을 성공했을 때 떴던 누군가의 로그인 시도 기록을 떠올렸다. '그 로그는 무엇이었을까? 강의식이 또 부주의하게 누구한테 코인에 대해서 알려준 건 아니겠지...' 먼저 환금해야 한다는 생각이 들면서 마음이 급해졌다.
        `
      }    
    },
    
    // NOTE 코인을 못 찾았을 경우 스크립트 추가??
    //inter_coin_fail: ``

    
    ghost1: `
    그때, 자기들끼리 이야기를 하던 경찰 한 명이 다가왔다. "일단 사유지 침입 건도 조사를 마저 해야 하니 여기 계신 ${alive_count[0]} 다 같이 서로 동행하시죠."
    <br><br>
    ${alive_count[0]}이라니? 그러고 보니, 류영이 없었다. 자리에 있었던 흔적조차 없었다. 서늘한 기운만 감돌 뿐이었다. 방금 전까지만해도 있었는데...?
    `,
    
    ghost2: `
    한 명이 더 있었다고 이야기하자 주변의 경찰들이 모두 이상하게 쳐다 보았다. 
    <br><br>
    "아니 들어올 때부터 ${alive_count[1]} 밖에 없었는데 어디 다 같이 귀신에 씌였나..." 한 명이 투덜거리더니 앞장 서 현관으로 나갔다.
    `,
    
		// TODO: ryu monologue
    ryu: {
      succ: "[[복수 성공]]",
      fail: "[[복수 실패]]",
      ascend: "[[성불]]",
      found: "[[정체 발각]]"
    },
    
		// 마무리
    ending: `
    그 저택은 이후에도 계속되는 기현상으로 아무도 사려는 사람이 없었고, 시간이 흘러 귀신 들린 집으로 소문나 무당들이나 이따금씩 찾아오는 곳이 되었다.
    `,
    
		// 배드 엔딩
    // bad_ending: `<span style="color:red">너흰 이제 아무도 못 나가.</span>`
    bad_ending: `
		류영이 멍하니 모두를 쳐다 보았다. "내가... 강의식을... 죽였다고요?"
		<br><br>
		갑자기 무언가 깨지는 소리와 함께 집 안의 모든 불이 꺼지고, 남은 사람들이 모두 놀라서 소리 지른다. 	누군가가 라이터를 켜서 현관문을 찾지만 문은 여전히 굳게 닫혀 있고 손잡이 조차 꿈쩍하지 않는다.
		<br><br>
		경찰에 신고하려고 핸드폰을 키자 통화가 불가한 지역이라고만 뜬다. 거실로 돌아왔을 때, 한가운데 기괴한 불빛 속에 류영이 홀로 서 있었다. 한참을 노려보다가 갑자기 그가 씨익 웃으며 말했다.
		<br><br>
		"오랜만에 손님이 왔네, 먹을 것 좀 준비해 올테니 소파에 앉으세요."
		<br><br>
		그는 부엌으로 가다 말고 멈춰서 나지막하게 말한다.
		<br><br>
		"편하게 계세요… <span style="font:bold; color:red;">어차피 아무도 못 나가니까.</span>"
		[[이거 괜찮아 다들?!?!]]
		` 
  }
  
  //---------------------------------------------------------------------------
  
  return script
}

// 스크립트 합치기
function BuildScript(script, inputs) {
  
  // 체포되는 사람
  arrested = WhoIsArrested(inputs.murder1, inputs.murder2, inputs.died)
  const arrested_list = arrested.ls
  
  // 생존자
  human = ['해님', '박승찬', '참새'];
  
  //-------------------------------------------------------------------------
  // 스크립트 시작
  let ending_script = ""
	/*
	`
  [inputs.died : [${inputs.died}]]<br>
  [inputs.murder1 : [${inputs.murder1}]]<br>
  [inputs.murder2 : [${inputs.murder2}]]<br>
  [[[${arrested_list.length}]]<br>
  [[ryu_score : ${ryu.score}]]<br>
  ` //for debugging
	*/
  
  // 사람이 죽었다!
  if (human.includes(inputs.died)){
    ending_script += script.dead.other;
  } else if (inputs.died == "류영") {
    ending_script += script.dead.ryu;
  }
  ending_script += "<br><br>";
  ending_script += script.inter_call;
  ending_script += "<br><br>";
  
  
  // 체포..?
  if (arrested_list.length > 0) {
    //
    ending_script += script.inter_arrest.yes;
    
    // 박승찬 체포
    if ((park.arrest !== 0) && (park.state == 1)) {
      if (park.arrest == 1) {
        ending_script += script.arrest.park.m1;
      } else if (park.arrest == 2) {
        ending_script += script.arrest.park.m2;
      } else if (park.arrest == 3) {
        ending_script += script.arrest.park.m2 + "<br><br>" + script.arrest.park.m3;
      }
      ending_script += "<br><br>"
    }
    
    // 이혜원 체포
    if ((lee.arrest !== 0) && (lee.state == 1)) {
      if (lee.arrest == 1) {
        ending_script += script.arrest.lee.m1;
      } else if (lee.arrest == 2) {
        ending_script += script.arrest.lee.m2;
      } else if (lee.arrest == 3) {
        ending_script += script.arrest.lee.m1 + "<br><br>" + script.arrest.lee.m3;
      }
      ending_script += "<br><br>"
    }
    
    // 서유정 체포
    if ((seo.arrest !== 0) && (seo.state == 1)) {
      ending_script += script.arrest.seo;
      ending_script += "<br><br>";
    }
    
  } else {
    // 모두 죽음
    ending_script += script.inter_arrest.all_dead;
		ending_script += "<br><br>"
  }
  
  // ending_script += script.inter_arrest2 + "<br><br>";
  

  // 코인을 찾았는가
  if ((lee.coin && lee.state) || (seo.coin && seo.state)) {
    ending_script += script.inter_coin;
    
    // 이혜원 코인
    if (lee.coin && lee.state) {
      if (lee.arrest !== 0) {
        ending_script += script.coin.lee.arrested;
      } else {
        ending_script += script.coin.lee.free;
      }
      ending_script += "<br><br>"
      
      if (seo.coin && seo.state) {  // 서유정도 찾으면
        ending_script += script.coin.lee.sus;
      }
    }
    
    // 서유정 코인
    if (seo.coin && seo.state) {
      if (seo.arrest !== 0) {
        ending_script += script.coin.seo.arrested;
      } else {
        ending_script += script.coin.seo.free;
      }
      ending_script += "<br><br>"
      
      if (lee.coin && lee.state) {  // 이혜원도 찾으면
        ending_script += script.coin.seo.sus + "<br><br>";
      }
    }
    
  }
  
  
  // 류영이 없다!
  ending_script += script.ghost1 + "<br><br>";
  ending_script += script.ghost2 + "<br><br>";
  
  
  // 류영 독백
  if (ryu.ident) {	// 발각
    ending_script += script.ryu.found;
  } else if (ryu.state == 0) {	// 성불
    ending_script += script.ryu.ascend;
  } else if (lee.state == 0) {	// 복수 성공
    ending_script += script.ryu.succ;		
  } else if (lee.state == 1) {	// 복수 실패 (지박령)
    ending_script += script.ryu.fail;
  }
  ending_script += "<br><br>"
  
  // 마무리
  ending_script += script.ending;
  
  // 배드 엔딩
  if (inputs.murder1 == "류영") {
    ending_script = script.bad_ending;
  }
  
  return ending_script
}

//----------------------------------------------------------------------------------- 

function GetEnding() {
  
  var inputs = GetInputs()
  
  // 인물 별 상태
  ryu = new Character("류영")
  ryu.StateUpdate(inputs)
  ryu.GetScore(inputs)
  
  lee = new Character("해님")
  lee.StateUpdate(inputs)
  lee.GetScore(inputs)
  
  seo = new Character("참새")
  seo.StateUpdate(inputs)
  seo.GetScore(inputs)
  
  park = new Character("박승찬")
  park.StateUpdate(inputs)
  park.GetScore(inputs)
  
  
  // 스크립트 만들기
  script = ScriptComponents(inputs)
  ending_script = BuildScript(script, inputs)
  
  // 엔딩 탭
  document.getElementById("ending_script").innerHTML = ending_script;
  
  // 점수 탭
  document.getElementById("ryu_score" ).innerHTML = ryu.score;
  document.getElementById("park_score").innerHTML = park.score;
  document.getElementById("lee_score" ).innerHTML = lee.score;
  document.getElementById("seo_score" ).innerHTML = seo.score;
  
}

