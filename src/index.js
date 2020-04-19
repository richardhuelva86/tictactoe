import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className="square"
      style={props.style}
      onClick={() => props.onClick()}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let style = this.props.combination.includes(i)
      ? { border: '2px solid black' }
      : null;
    return (
      <Square
        style={style}
        key={i + 'col'}
        value={this.props.squares[i]}
        onClick={() => this.props.click(i)}
      />
    );
  }

  createTable = () => {
    const colRows = [];

    for (let row = 0; row < 3; row++) {
      let children = [];
      for (let column = 0; column < 3; column++) {
        let elem = this.renderSquare(row * 3 + column);
        children.push(elem);
      }
      colRows.push(
        <div key={row} className="board-row">
          {children}
        </div>
      );
    }

    return colRows;
  };

  render() {
    const colRows = this.createTable();

    return <div>{colRows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          colRows: Array(9).fill({ column: null, row: null }),
        },
      ],
      isNext: true,
      stepNumber: 0,
      currentlySelected: null,
      order: true,
      winnerIndexes: [],
    };
  }

  getColumn(i) {
    return (i % 3) + 1;
  }

  getRow(i) {
    if (i < 3) {
      return 1;
    } else if (i < 6) {
      return 2;
    } else return 3;
  }

  handleClick(i) {
    let history;
    if (this.state.order) {
      history = this.state.history.slice(0, this.state.stepNumber + 1);
    } else {
      history = this.state.history.slice(-(this.state.stepNumber + 1));
    }
    let current;
    if (this.state.order) {
      current = history[history.length - 1];
    } else {
      current = history[0];
    }
    const squares = current.squares.slice();

    if (this.calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.isNext ? 'X' : 'O';
    const newStepNumber = history.length;

    let newHistory;
    if (this.state.order) {
      newHistory = history.concat([
        {
          squares: squares,
          colRows: { column: this.getColumn(i), row: this.getRow(i) },
        },
      ]);
    } else {
      newHistory = [
        {
          squares: squares,
          colRows: { column: this.getColumn(i), row: this.getRow(i) },
        },
        ...history,
      ];
    }
    this.setState({
      history: newHistory,
      isNext: !this.state.isNext,
      stepNumber: newStepNumber,
      currentlySelected: null,
    });
  }

  calculateWinner(squares) {
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
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];

      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return { winner: squares[a], combination: [a, b, c] };
      }
    }
    return null;
  }

  jumpTo(move) {
    this.setState({
      stepNumber: this.state.order
        ? move
        : this.state.history.length - 1 - move,
      isNext: move % 2 === 0,
      currentlySelected: this.state.order
        ? move
        : this.state.history.length - 1 - move,
    });
  }

  switchOrder() {
    // currentlySelected = this.state.order
    //   ? this.state.currentlySelected
    //   : this.state.history.length - 1 - this.state.currentlySelected;
    this.setState({
      history: this.state.history.reverse(),
      order: !this.state.order,
      // stepNumber: this.state.history.length - 1 - this.state.stepNumber,
    });
  }

  render() {
    let history = this.state.history;
    let index = this.state.order
      ? this.state.stepNumber
      : this.state.history.length - 1 - this.state.stepNumber;

    const current = history[index];
    let winner,
      combination = [];
    const res = this.calculateWinner(current.squares);
    if (res) {
      winner = res.winner;
      combination = res.combination;
    }

    let status;

    if (winner) {
      console.log('hay ganador');
      status = `Winner is player ${winner === 'X' ? '1' : '2'}`;
      // winnerIndexes = this.state.winnerIndexes;
    } else {
      status = `Current player:  ${this.state.isNext ? '1' : '2'}`;
    }

    if (!winner && current.squares.every((sq) => sq != null)) {
      status = `Tie game!`;
    }

    const reverse = !this.state.order;

    return (
      <div className="game">
        <div className="game-board">
          <Board
            combination={combination}
            squares={current.squares}
            click={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <h2>Movements list</h2>
          <ol reversed={reverse}>
            {history.map((step, move) => {
              let currentlySelected = this.state.order
                ? this.state.currentlySelected
                : this.state.currentlySelected
                ? this.state.history.length - 1 - this.state.currentlySelected
                : null;
              const movOrder = this.state.order
                ? move
                : this.state.history.length - move - 1;

              const desc = (
                this.state.order ? move : move !== this.state.history.length - 1
              )
                ? `Go to move # ${movOrder} [F${step.colRows.row}, C${step.colRows.column}]`
                : 'Go to game start';
              const style =
                move === currentlySelected ? { fontWeight: 'bold' } : null;
              return (
                <li key={move}>
                  <button style={style} onClick={() => this.jumpTo(move)}>
                    {desc}
                  </button>
                </li>
              );
            })}
          </ol>
          <button onClick={() => this.switchOrder()}>Switch order</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById('root'));
