import { useEffect, useState } from 'react'
import _shuffle from 'lodash.shuffle'
import _cloneDeep from 'lodash.clonedeep'

const boardSize = 3
const tileCount = boardSize * boardSize
const gapSize = 10

//this should not be shuffled, just randomly trigger shuffle for a few times, to be sure it's possible to solve
const shuffleBoard = (board) => _shuffle(board)

const initialBoardData = Array(tileCount)
  .fill({})
  .map((_, id) => ({ id }))

const App = () => {
  const isMobile = window.innerWidth < 690

  const tileWidth = isMobile ? 100 : 200
  const tileHeight = isMobile ? 100 : 200

  const boardDimenstions = {
    x: boardSize * tileWidth,
    y: boardSize * tileHeight,
  }

  const getMatrixPosition = (index) => {
    return {
      row: Math.floor(index / boardSize),
      col: index % boardSize,
    }
  }
  const [score, setScore] = useState(0)
  const [board, setBoard] = useState(initialBoardData)
  const [hoveredTile, setHoveredTile] = useState(null)
  const [ready, setReady] = useState(false)
  const [checkBoard, setCheckBoard] = useState(0)

  const [userOrderArrayIndexes, setUserOrderArrayIndexes] = useState(
    [],
  )

  useEffect(() => {
    const shuffledBoard = shuffleBoard(board)
    const completeShuffledBoard = shuffledBoard.map((tile, id) => ({
      index: id,
      value: tile.id + 1,
      row: Math.floor(id / boardSize),
      col: id % boardSize,
      disabled: Boolean(tile.id === tileCount - 1),
    }))
    setBoard(completeShuffledBoard)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!checkBoard) return

    setScore((prev) => prev + 1)

    const orderedIndexes = [...board]
      .sort((a, b) => {
        if (a.value < b.value) return -1
        if (a.value > b.value) return 1

        return 0
      })
      .map(({ index }) => index)
    setUserOrderArrayIndexes(orderedIndexes)
  }, [checkBoard])

  const handleHoverTile = (index) => {
    if (typeof index === 'object') {
      setHoveredTile()
      return
    }
    const hoveredTile = board.find((tile) => tile.index === index)
    setHoveredTile(hoveredTile)
  }

  const canSwap = (emptyTile, clickedTile) => {
    const { row: srcRow, col: srcCol } = getMatrixPosition(
      emptyTile.index,
    )
    const { row: destRow, col: destCol } = getMatrixPosition(
      clickedTile.index,
    )

    return (
      Math.abs(srcRow - destRow) + Math.abs(srcCol - destCol) === 1
    )
  }

  const handleSwap = (clickedTile) => {
    const emptyTile = board.find((tile) => tile.disabled === true)
    if (clickedTile.index === emptyTile.index) return
    setCheckBoard((prev) => prev + 1)
    const swapPossible = canSwap(emptyTile, clickedTile)
    if (swapPossible) {
      const newBoard = [...board].map((tile) => {
        //new disabled tile
        if (tile.index === clickedTile.index) {
          return {
            index: clickedTile.index,
            value: emptyTile.value,
            row: Math.floor(tile / boardSize),
            col: tile % boardSize,
            disabled: true,
          }
        }

        //new disabled postition
        if (tile.index === emptyTile.index) {
          return {
            index: emptyTile.index,
            value: clickedTile.value,
            row: Math.floor(tile / boardSize),
            col: tile % boardSize,
            disabled: false,
          }
        }
        return { ...tile }
      })

      setBoard(newBoard)
    }
  }

  const isSuccess =
    userOrderArrayIndexes.length > 0 &&
    userOrderArrayIndexes.every((v, i, a) => !i || a[i - 1] <= v)

  if (isSuccess) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '40%',
          textAlign: 'center',
          width: '100%',
        }}
      >
        you did it! your score is {score}
      </div>
    )
  }

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '20px',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {!score ? `Your score:  ${score}` : 'click on a tile'}
      </div>
      <div
        style={{
          display: 'grid',
          placeContent: 'center',
          height: '100vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            placeContent: 'center',
            width: `${boardDimenstions.x}px`,
            height: `${boardDimenstions.y}px`,
            background: '#dedede',
            padding: '20px',
            gap: `${gapSize}px`,
          }}
          onMouseLeave={handleHoverTile}
        >
          {board.map((tile) => {
            if (!ready) return null

            return (
              <div
                onClick={() => handleSwap(tile)}
                onMouseEnter={() => handleHoverTile(tile.index)}
                key={tile.index}
                style={{
                  maxWidth: isMobile
                    ? `calc(100% / ${boardSize})`
                    : '100%',
                  cursor: tile.disabled ? 'not-allowed' : 'pointer',
                  opacity: tile.disabled ? 0 : 1,
                  width: `${tileWidth - gapSize}px`,
                  height: `${tileHeight - gapSize}px`,
                  display: 'grid',
                  placeContent: 'center',
                  background:
                    hoveredTile && hoveredTile.index === tile.index
                      ? '#bebebe'
                      : '#f4f4f4',
                }}
              >
                {tile.value}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default App
