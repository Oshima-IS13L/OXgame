//メモ　2025/10/14
//親コンポーネントから子コンポーネントへデータを渡すための仕組みが基本
//アレンジ箇所・100行目_ゲーム開始ボタンを押したときに、アラートを表示
//　　　　・109行目_ボタンを日本語表記に変更
//　　　　・125行目_3目並べというタイトルを表示
//materialUIを使った箇所・16行目_四角の見た目
//　　　　・134行目_ボタンの見た目
//　　　　・保存ボタン追加箇所（ローカル保存対応）

//インポート
// React の useStateをインポート（状態を管理するために使う）
import { useState } from 'react';
// MUIのButtonコンポーネントとLoadingButtonを追加
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';

//各マス（Square）コンポーネント
function Square({ value, onSquareClick }) {
  // 各マスのボタンを表示。クリック時に onSquareClick 関数を呼び出す
  return (
    <Button
      variant="outlined"     // 枠線付きボタン
      onClick={onSquareClick} // クリック時の処理
      sx={{
        width: 60,            // 幅
        height: 60,           // 高さ
        fontSize: 24,         // 文字サイズ
        minWidth: 0,          // 最小幅を無効化
        margin: 0.3,          // 余白
        borderWidth: 2,       // 枠線の太さ
        fontWeight: 'bold'    // 太字
      }}
    >
      {value}  {/* X、O、または空白を表示 */}
    </Button>
  );
}

//保存ボタンコンポーネント
// 保存ボタンコンポーネント（MUI + ローディング付き）
function SaveButton({ onSave }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // 保存中の演出
    onSave(); // 保存処理
    setLoading(false);
  };

  return (
    <LoadingButton
      loading={loading}
      variant="contained"
      color="success"
      onClick={handleClick}
      sx={{ marginTop: 2 }}
    >
      保存する
    </LoadingButton>
  );
}

//盤面（Board）コンポーネント
function Board({ xIsNext, squares, onPlay }) {
  // i 番目のマスがクリックされた時に呼ばれる関数
  function handleClick(i) {
    // 勝者が決まっている、またはすでに埋まっているマスなら何もしない
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    // 現在の盤面をコピーして、新しい配列を作る（stateを直接変更しない）
    const nextSquares = squares.slice();

    // 現在の手番が X なら X、そうでなければ O を代入
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }

    // 親コンポーネント（Game）に次の盤面を渡す
    onPlay(nextSquares);
  }

  // 勝者を計算
  const winner = calculateWinner(squares);
  // ステータス文字列
  let status;
  if (winner) {
    status = 'Winner: ' + winner; // 勝者がいる場合
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O'); // 次の手番を表示
  }

  // 実際の盤面の描画
  //アロー (=>) の後のコードが実行され、handleClick() が呼び出される。ここまでで、マスにXを置けるようになる。
  return (
    <>
      {/* ステータス表示 */}
      <div className="status">{status}</div>

      {/* 各行のマスを3個ずつ表示 */}
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

//ゲーム（Game）コンポーネント 
export default function Game() {
  // 盤面の履歴を配列として保存。初期状態は9マス全てnull
  const [history, setHistory] = useState([Array(9).fill(null)]);
  // 現在の手数（どの状態を見ているか）
  const [currentMove, setCurrentMove] = useState(0);

  //現在の手数 (currentMove) が偶数ならXの番、奇数ならOの番
  const xIsNext = currentMove % 2 === 0;

  //現在の盤面を履歴から取得
  const currentSquares = history[currentMove];

  //1手進んだ時の処理
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // 過去の手に戻る関数
  function jumpTo(nextMove) {
    if (nextMove === 0){
      alert("ゲームを開始します\n'O'と'X'のどちらを担当するかを決めて下さい。");
    }
    setCurrentMove(nextMove);
  }

  // 保存処理（ローカルストレージに保存）
  function handleSave() {
    const gameData = {
      history,
      currentMove,
      savedAt: new Date().toLocaleString(),
    };
    localStorage.setItem("tictactoe_save", JSON.stringify(gameData));
    alert("勝負内容を保存しました！");
  }

  // 保存データを読み込む処理
  function handleLoad() {
    const savedData = localStorage.getItem("tictactoe_save");
    if (savedData) {
      const { history, currentMove } = JSON.parse(savedData);
      setHistory(history);
      setCurrentMove(currentMove);
      alert("保存データを読み込みました！");
    } else {
      alert("保存データがありません。");
    }
  }

  // 過去の手に戻る用のリストを作成
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = move + '手目に戻る';  // N手目へ戻る
    } else {
      description = 'ゲーム開始';     // ゲーム開始時へ戻る
    }
    return (
      <li key={move}> {/* 各手のリスト要素 */}
        <Button
          variant="contained"   // 塗りつぶしボタン
          color="primary"       // 青系の基本色
          size="medium"         // サイズ
          onClick={() => jumpTo(move)} // クリック時に移動
          sx={{ marginY: 0.5 }} // 上下に少し余白
        >
          {description}
        </Button>
      </li>
    );
  });

  // ゲーム画面の描画
  return (
    <div className="game">
      {/* タイトルと画像を横並びにする */}
      <div className="title-container">
        <h1 className="title">3目並べ</h1>
        <img src="/P_game.png" className="title-image" />
      </div>

      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>

      <div className="game-info">
        <ul style={{ listStyleType: "none", padding: 0 }}>{moves}</ul>


        {/* 🔹保存ボタン追加（MUIのローディング付き） */}
        <SaveButton onSave={handleSave} />

        {/* 🔹ロードボタンも追加 */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleLoad}
          sx={{ marginTop: 1 }}
        >
          保存データを読み込む
        </Button>
      </div>
    </div>
  );
}

//勝者を判定する関数
function calculateWinner(squares) {
  // 勝ちパターンの組み合わせ
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // 各行をチェックして、3つ並んだら勝者を返す
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; //'X'または'O'
    }
  }

  // 勝者がいなければnull
  return null;
}
