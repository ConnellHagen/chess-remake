var mainBoard;
var pieceImg;
var tempPiece;
var isDrag;
var offDrag = new Array(2);
var pawnPMenu;
var pawnPCoords;
var tempTurn
var yellowSquares = new Array(4);
var oldCoords;


function setup() {
  createCanvas(1280 , 720);
  
  //makes the pieces array to insert into 
  let pieces = new Array(8);
  for(let i=0; i<pieces.length; i++){
    pieces[i] = new Array(8);
  }
  mainBoard = new Board([46,49,205], [234,234,234], pieces);
  
  //attaches all piece images to variable names
  blackPawn = loadImage('chessPieces/blackPawn.png');
  blackKnight = loadImage('chessPieces/blackKnight.png');
  blackBishop = loadImage('chessPieces/blackBishop.png');
  blackRook = loadImage('chessPieces/blackRook.png');
  blackKing = loadImage('chessPieces/blackKing.png');
  blackQueen = loadImage('chessPieces/blackQueen.png');
  whitePawn = loadImage('chessPieces/whitePawn.png');
  whiteKnight = loadImage('chessPieces/whiteKnight.png');
  whiteBishop= loadImage('chessPieces/whiteBishop.png');
  whiteRook = loadImage('chessPieces/whiteRook.png');
  whiteKing = loadImage('chessPieces/whiteKing.png');
  whiteQueen = loadImage('chessPieces/whiteQueen.png');
  voidPiece = loadImage('chessPieces/void.png');
  pawnPMenu = false;
 
}

function draw() {
  background(220);
  mainBoard.display();
}

class Board{
  
  constructor(color1, color2, cPieceList){
    this.color1 = color1;
    this.color2 = color2;
    this.pieces = cPieceList;
    this.turn = 'white';

    this.resetBoard();
  }
  
  display(){
    
    let tempBoard = this.getPieceList();

    noStroke();
    
    //makes the board
    fill(this.color1[0],this.color1[1],this.color1[2]);
    square(320,40,640);
    fill(this.color2[0],this.color2[1],this.color2[2]);
    for(let i=0;i<8;i+=2){
      for(let j=0;j<8;j+=2){
        square(320+j*80,40+i*80,80);
      }
    }
    for(let i=1;i<8;i+=2){
      for(let j=1;j<8;j+=2){
        square(320+j*80,40+i*80,80);
      }
    }
    
    //overlay colored squares for last move
    noStroke();
    let color1;
    let color2;
    
    if((yellowSquares[0]+yellowSquares[1])%2==0){
      color1 = color(220,220,120);
    }else{
      color1 = color(190,190,90);
    }
    fill(color1);
    square(320+yellowSquares[0]*80,40+yellowSquares[1]*80,80);

    

    if((yellowSquares[2]+yellowSquares[3])%2==0){
      color2 = color(220,220,120);
    }else{
      color2 = color(190,190,90);
    }
    fill(color2);
    square(320+yellowSquares[2]*80,40+yellowSquares[3]*80,80);
    
    //displays all pieces located in the this.pieces array
    for(let i=0; i<8; i++){
      for(let j=0;j<8;j++){
        this.getPieceList()[i][j].display();
      }
    }
    
    //allows you to drag the piece around freely
    if(isDrag){
      tempPiece.display();
    }
    
    //allows the pawn promotion menu to exist
    if(pawnPMenu){
      mainBoard.pawnMenu();
    }
    
  }
  
  getTurn(){
    return this.turn;
  }
  
  setTurn(turn){
    this.turn = turn;
  }
  
  getPieceList(){
    let tempList = new Array(8);
    return Object.assign(tempList, this.pieces);
  }
  
  setPieceList(tempPieceList){
    this.pieces = tempPieceList;
  }
  
  removePiece(locatX, locatY){
    let emptySquare = new Square('void', [locatX,locatY], 'void');
    this.pieces[locatX][locatY] = emptySquare;
  }
  
  addPiece(square, locatX, locatY){
    this.pieces[locatX][locatY] = square;
  }
  
  isKing(){
    for(let i=0; i<8; i++){
      for(let j=0; j<8; j++){
        if(this.getPieceList()[i][j].getColor() == this.getTurn() && this.getPieceList()[i][j].getPiece()=='king'){
          return true;
        }
      }
    }
    return false;
  }
  
  getKingCoords(){
    
    for(let i=0; i<8; i++){
      for(let j=0; j<8; j++){
        
        if(this.getPieceList()[i][j].getColor() == this.getTurn() && this.getPieceList()[i][j].getPiece()=='king'){
          return this.getPieceList()[i][j].getPos();
        }
        

      }
    }
    
  }
  
  switchTurn(){

    switch(this.turn){
      case 'white':
        this.turn = 'black';
        break;
      case 'black':
        this.turn = 'white';
        break;
    }
    
  }
  
  //detects if a given move is legal, including check detection
  isLegalMove(pieceA, squareB){
    
    let tempBoard = this.getPieceList();
    
    if(this.isLegalMovement(pieceA, squareB) == 'en passant'){
      return 'en passant';
    }
    
    if(this.isLegalMovement(pieceA, squareB) == 'castle'){
      return 'castle';
    }
    
    if(this.isLegalMovement(pieceA, squareB) == 'promotion'){
      return 'promotion';
    }  
    
    //tests if a move is legal with no regard to checks
    if(!this.isLegalMovement(pieceA, squareB)){
      return false;
    }
    
    //test if the move puts their king into check
    if(this.isInCheckNext(pieceA, squareB)){
      return false;
    }

    //default return
    return true;    
    
  }
  
  //detects if a piece is moving in a legal way; called from isLegalMove; no checks to avoid recursion.
  isLegalMovement(pieceA, squareB){
    
    let tempBoard = this.getPieceList();
    
    //no leaving the board
    if(squareB[0]>7 || squareB[0]<0 || squareB[1]>7 || squareB[1]<0){
      return false;
    }
    
    //no going on the same square - skipping turns
    if(squareB[0]==pieceA.getPos()[0] && squareB[1]==pieceA.getPos()[1]){
      return false;
    }
    
    //cannot move onto a square with a piece of your color
    if(tempBoard[squareB[0]][squareB[1]].getColor()==pieceA.getColor()){
      return false;
    }
    
    
    switch(pieceA.getPiece()){
      
    //pawn rules
    case('pawn'):
      //en passant
      if(yellowSquares[0] == squareB[0] && yellowSquares[1] == squareB[1]-1 && (squareB[0]==pieceA.getPos()[0]+1 || squareB[0]==pieceA.getPos()[0]-1) && squareB[1] == pieceA.getPos()[1] -1 && tempBoard[squareB[0]][squareB[1]+1].getPiece()=='pawn'){
       
        return 'en passant';
      }
      
      //google en passant
      else if(yellowSquares[0] == squareB[0] && yellowSquares[1] == squareB[1]+1 && (squareB[0]==pieceA.getPos()[0]+1 || squareB[0]==pieceA.getPos()[0]-1) && squareB[1] == pieceA.getPos()[1] +1 && tempBoard[squareB[0]][squareB[1]-1].getPiece()=='pawn'){
       
        return 'en passant';
      }
      
      //test the square moving to is empty
      if(tempBoard[squareB[0]][squareB[1]].getColor()=='void'){
        
        //testing that it is one square forward or two squares on the first move
        if(this.turn=='white'){
          if(squareB[0]==pieceA.getPos()[0] && squareB[1]==pieceA.getPos()[1]-1){
            
            if(squareB[1]==0){
              return 'promotion';
            }
            return true;
            
          }else if(squareB[0]==pieceA.getPos()[0] && squareB[1]==pieceA.getPos()[1]-2 && squareB[1]==4){
            
            //checking that both squares the pawn jumps through are empty
            if(tempBoard[squareB[0]][squareB[1]+1].getColor()=='void'){
              return true;
            }else{
              return false;
            }

          } 
        }
        else if(this.turn == 'black'){
          if(squareB[0]==pieceA.getPos()[0] && squareB[1]==pieceA.getPos()[1]+1){
            
            if(squareB[1]==7){
              return 'promotion';
            }
            
            return true;
          } else if(squareB[0]==pieceA.getPos()[0] && squareB[1]==pieceA.getPos()[1]+2 && squareB[1]==3){
            
            //checking that both squares the pawn jumps through are empty
            if(tempBoard[squareB[0]][squareB[1]-1].getColor()=='void'){
              return true;
            }else{
              return false;
            }
            
          } 
        }
        
      //diagonal captures IFF there is a piece there (of opposite color)
      }else{
        if(this.turn=='white'){
          if((squareB[0]==pieceA.getPos()[0]+1 || squareB[0]==pieceA.getPos()[0]-1) && squareB[1]==pieceA.getPos()[1]-1 && tempBoard[squareB[0]][squareB[1]].getColor()=='black'){
            if(squareB[1]==0){
              return 'promotion';
            }
            return true;
          }
        }
        else if(this.turn == 'black'){
          if((squareB[0]==pieceA.getPos()[0]+1 || squareB[0]==pieceA.getPos()[0]-1) && squareB[1]==pieceA.getPos()[1]+1 && tempBoard[squareB[0]][squareB[1]].getColor()=='white'){
            if(squareB[1]==7){
              return 'promotion';
            }
            return true;
          }
        }
      }
      break;
    
    //knight rules
    case('knight'):
      //2 sideways, 1 vertical
      if(Math.abs(squareB[0]-pieceA.getPos()[0])==2 && Math.abs(squareB[1]-pieceA.getPos()[1])==1){
         return true;
      //1 sideways, 2 vertical
      } else if(Math.abs(squareB[0]-pieceA.getPos()[0])==1 && Math.abs(squareB[1]-pieceA.getPos()[1])==2){
         return true;
      }
      break;
    
    //bishop rules
    case('bishop'):
              //tests if the new square is diagonal
      let isDiag;
      for(let x=-8; x<8; x++){
        if((pieceA.getPos()[0]+x==squareB[0] || pieceA.getPos()[0]-x==squareB[0]) && (pieceA.getPos()[1]+x==squareB[1] || pieceA.getPos()[1]-x==squareB[1])){
          isDiag=true;
        }
      }
      if(!isDiag){
        return false;
      }
      
      //tests if there is a piece in the way
        if(pieceA.getPos()[0]>squareB[0]){
          
          //move up and left
          if(pieceA.getPos()[1]>squareB[1]){
            for(let x=1; x+squareB[0] < pieceA.getPos()[0]; x++){
              if(tempBoard[pieceA.getPos()[0] - x][pieceA.getPos()[1] - x].getPiece()!='void'){
                return false;
              }
            }
            
          //move down and left
          }else{
            for(let x=1; x+squareB[0] < pieceA.getPos()[0]; x++){
              if(tempBoard[pieceA.getPos()[0] - x][pieceA.getPos()[1] + x].getPiece()!='void'){
                return false;
              }
            }
          }
          
        //move up and right
        }else{
          if(pieceA.getPos()[1]>squareB[1]){
            for(let x=1; squareB[0] > x+pieceA.getPos()[0]; x++){
              if(tempBoard[pieceA.getPos()[0] + x][pieceA.getPos()[1] - x].getPiece()!='void'){
                return false;
              }
            }
            
          //move down and right
          }else{
            for(let x=1; squareB[0] > x+pieceA.getPos()[0]; x++){
              if(tempBoard[pieceA.getPos()[0] + x][pieceA.getPos()[1] + x].getPiece()!='void'){
                return false;
              }
            }
          }
      }
      
      //default return statement
      return true;
      //compiler thinks `break` here is a mistake but i dont care im right as always
      break;
    
    //rook rules
    case('rook'):
        
      //tests straight line movement
      if(squareB[0]!=pieceA.getPos()[0] && squareB[1]!=pieceA.getPos()[1]){
        return false;
      }
      
      //prevents jumping over pieces
      if(squareB[0]!=pieceA.getPos()[0]){
        if(squareB[0]>pieceA.getPos()[0]){
          for(let i = pieceA.getPos()[0] + 1; i<squareB[0]; i++){
            if(tempBoard[i][squareB[1]].getColor()!='void'){
               return false;
            }
          }
        }else{
          for(let i = pieceA.getPos()[0] - 1; i>squareB[0]; i--){
            if(tempBoard[i][squareB[1]].getColor()!='void'){
               return false;
            }
          }
        }
      }else if(squareB[1]!=pieceA.getPos()[1]){
        if(squareB[1]>pieceA.getPos()[1]){
          for(let i = pieceA.getPos()[1] + 1; i<squareB[1]; i++){
            if(tempBoard[squareB[0]][i].getColor()!='void'){
               return false;
            }
          }
        }else{
          for(let i = pieceA.getPos()[1] - 1; i>squareB[1]; i--){
            if(tempBoard[squareB[0]][i].getColor()!='void'){
               return false;
            }
          }
        }
      }
      
      //default return if above conditions are true
      return true;
      //compiler thinks it knows better here but its dumb so i dont care
      break;
     
    //queen rules
    case('queen'):
      //tests straight line movement
      let straightLine = !(squareB[0]!=pieceA.getPos()[0] && squareB[1]!=pieceA.getPos()[1]);
      let diagLine;
      for(let x=-8; x<8; x++){
        if((pieceA.getPos()[0]+x==squareB[0] || pieceA.getPos()[0]-x==squareB[0]) && (pieceA.getPos()[1]+x==squareB[1] || pieceA.getPos()[1]-x==squareB[1])){
          diagLine=true;
        }
      }
      
      //if illegal direction, do not allow
      if(!straightLine && !diagLine){
        return false;
      }
      
      if(straightLine){
        
        //stolen from the rook line
        if(squareB[0]!=pieceA.getPos()[0]){
          if(squareB[0]>pieceA.getPos()[0]){
            for(let i = pieceA.getPos()[0] + 1; i<squareB[0]; i++){
              if(tempBoard[i][squareB[1]].getColor()!='void'){
               return false;
              }
            }
          }else{
            for(let i = pieceA.getPos()[0] - 1; i>squareB[0]; i--){
              if(tempBoard[i][squareB[1]].getColor()!='void'){
                return false;
              }
            }
          }
        }else if(squareB[1]!=pieceA.getPos()[1]){
          if(squareB[1]>pieceA.getPos()[1]){
            for(let i = pieceA.getPos()[1] + 1; i<squareB[1]; i++){
              if(tempBoard[squareB[0]][i].getColor()!='void'){
               return false;
              }
            }
          }else{
            for(let i = pieceA.getPos()[1] - 1; i>squareB[1]; i--){
              if(tempBoard[squareB[0]][i].getColor()!='void'){
                return false;
              }
            }
          }
        }
      }else if(diagLine){
        
        //stolen from the bishop line
        if(pieceA.getPos()[0]>squareB[0]){
         
          //move up and left
          if(pieceA.getPos()[1]>squareB[1]){
            for(let x=1; x+squareB[0] < pieceA.getPos()[0]; x++){
              if(tempBoard[pieceA.getPos()[0] - x][pieceA.getPos()[1] - x].getPiece()!='void'){
                return false;
              }
            }
            
          //move down and left
          }else{
            for(let x=1; x+squareB[0] < pieceA.getPos()[0]; x++){
              if(tempBoard[pieceA.getPos()[0] - x][pieceA.getPos()[1] + x].getPiece()!='void'){
                return false;
              }
            }
          }
         
        //move up and right
        }else{
          if(pieceA.getPos()[1]>squareB[1]){
            for(let x=1; squareB[0] > x+pieceA.getPos()[0]; x++){
              if(tempBoard[pieceA.getPos()[0] + x][pieceA.getPos()[1] - x].getPiece()!='void'){
                return false;
              }
            }
            
          //move down and right
          }else{
            for(let x=1; squareB[0] > x+pieceA.getPos()[0]; x++){
              if(tempBoard[pieceA.getPos()[0] + x][pieceA.getPos()[1] + x].getPiece()!='void'){
                return false;
              }
            }
          }
        }
      }
      
      //default return
      return true;
      break;
     
    //king rules
    case('king'):
      if(Math.abs(pieceA.getPos()[0]-squareB[0])<=1 && Math.abs(pieceA.getPos()[1]-squareB[1])<=1){
        return true;
      }else if(pieceA.castle()==true){
        
        //castling
        
        if(this.turn=='white'){
          if(squareB[0]==6 && squareB[1]==7){
            if(tempBoard[7][7].castle()){

              //test if spaces between are empty
              if(tempBoard[6][7].getPiece()!='void' || tempBoard[5][7].getPiece()!='void'){
                return false;
              }else{
                if(this.isInCheckNext(pieceA, [5,7]) || this.isInCheckNext(pieceA, [6,7])){
                  return false;
                }
                return 'castle';
              }
            }
          }else if(squareB[0]==2 && squareB[1]==7){
            if(tempBoard[0][7].castle()){
              
              if(tempBoard[1][7].getPiece()!='void' || tempBoard[2][7].getPiece()!='void' || tempBoard[3][7].getPiece()!='void'){
                return false;
              }
              if(this.isInCheckNext(pieceA,[3,7]) || this.isInCheckNext(pieceA, [2,7])){
                  return false;
              }
              return 'castle';
            }
          }
          
        //black castles
        }else{
          if(squareB[0]==6 && squareB[1]==0){
            if(tempBoard[7][0].castle()){
              if(tempBoard[6][0].getPiece()!='void' || tempBoard[5][0].getPiece()!='void'){
                return false;
              }
              if(this.isInCheckNext(pieceA, [5,0]), this.isInCheckNext(pieceA, [6,0])){
                return false;
              }
              return 'castle';
            }
          }else if(squareB[0]==2 && squareB[1]==0){
            if(tempBoard[0][0].castle()){
              if(tempBoard[1][0].getPiece()!='void' || tempBoard[2][0].getPiece()!='void' || tempBoard[3][0].getPiece()!='void'){
                return false;
              }
              if(this.isInCheckNext(pieceA, [3,0]) || this.isInCheckNext(pieceA, [2,0])){
                return false;
              }
              return 'castle';
            }
          }
        }
      }
        
    
    return false;
      break;
        
    //empty square pushed through catcher
    case('void'):
      return false;
      break;
        
    default:
      return false;
    }
    
  }
  
  //a part of the mess of determining check / mate
  isInCheckNext(pieceA, squareB){
    
    let tempPieces = new Array(8)
    for(let i=0; i<tempPieces.length; i++){
      tempPieces[i] = new Array(8);
    }
    
    let tempBoard = new Board([0,0,0],[0,0,0],tempPieces);
    
    for(let i=0; i<tempPieces.length; i++){
      for(let j=0; j<tempPieces.length; j++){
        
        tempPieces[i][j] = this.getPieceList()[i][j]; 
        
      }
    }
    
    tempBoard.setPieceList(tempPieces);
    tempBoard.makeMove(pieceA, squareB);
    tempBoard.setTurn(this.getTurn());
    
    if(tempBoard.isInCheck()){
      return true;
    }
    
    return false;
  }
  
  //tests if the board is in check
  isInCheck(){
    
    let kingCoords = this.getKingCoords();
    let a = kingCoords[0];
    let b = kingCoords[1];
    let board = this.getPieceList();
    
    //if king
    if(
      (board[clamp(a,0,7)][clamp(b-1,0,7)].getPiece()=='king' && board[clamp(a,0,7)][clamp(b-1,0,7)].getColor() != this.getTurn()) ||
      (board[clamp(a+1,0,7)][clamp(b-1,0,7)].getPiece()=='king' && board[clamp(a+1,0,7)][clamp(b-1,0,7)].getColor() != this.getTurn()) ||
      (board[clamp(a+1,0,7)][clamp(b,0,7)].getPiece()=='king' && board[clamp(a+1,0,7)][clamp(b,0,7)].getColor() != this.getTurn()) ||
      (board[clamp(a+1,0,7)][clamp(b+1,0,7)].getPiece()=='king' && board[clamp(a+1,0,7)][clamp(b+1,0,7)].getColor() != this.getTurn()) ||
      (board[clamp(a,0,7)][clamp(b+1,0,7)].getPiece()=='king' && board[clamp(a,0,7)][clamp(b+1,0,7)].getColor() != this.getTurn()) ||
      (board[clamp(a-1,0,7)][clamp(b+1,0,7)].getPiece()=='king' && board[clamp(a-1,0,7)][clamp(b+1,0,7)].getColor() != this.getTurn()) ||
      (board[clamp(a-1,0,7)][clamp(b,0,7)].getPiece()=='king' && board[clamp(a-1,0,7)][clamp(b,0,7)].getColor() != this.getTurn()) ||
      (board[clamp(a-1,0,7)][clamp(b-1,0,7)].getPiece()=='king' && board[clamp(a-1,0,7)][clamp(b-1,0,7)].getColor() != this.getTurn())
      ){

       return true;
    }
    
    
    //if pawn
    if(((board[clamp(a+1,0,7)][clamp(b-1,0,7)].getPiece()=='pawn' && board[clamp(a+1,0,7)][clamp(b-1,0,7)].getColor()=='black')|| (board[clamp(a-1,0,7)][clamp(b-1,0,7)].getPiece()=='pawn' && board[clamp(a-1,0,7)][clamp(b-1,0,7)].getColor()=='black')) &&(this.getTurn()=='white')){
      

      return true;
    }
    else if(((board[clamp(a+1,0,7)][clamp(b+1,0,7)].getPiece()=='pawn' && board[clamp(a+1,0,7)][clamp(b+1,0,7)].getColor()=='white')|| (board[clamp(a-1,0,7)][clamp(b+1,0,7)].getPiece()=='pawn' && board[clamp(a-1,0,7)][clamp(b+1,0,7)].getColor()=='white')) && (this.getTurn()=='black')){

      return true;
    }
    
    //if knight
    if((board[clamp(a+1,0,7)][clamp(b+2,0,7)].getPiece()=='knight' && board[clamp(a+1,0,7)][clamp(b+2,0,7)].getColor() != this.getTurn()) || (board[clamp(a+2,0,7)][clamp(b+1,0,7)].getPiece()=='knight' && board[clamp(a+2,0,7)][clamp(b+1,0,7)].getColor() != this.getTurn()) || (board[clamp(a-1,0,7)][clamp(b+2,0,7)].getPiece()=='knight' && board[clamp(a-1,0,7)][clamp(b+2,0,7)].getColor() != this.getTurn()) || (board[clamp(a+2,0,7)][clamp(b-1,0,7)].getPiece()=='knight' && board[clamp(a+2,0,7)][clamp(b-1,0,7)].getColor() != this.getTurn()) || (board[clamp(a+1,0,7)][clamp(b-2,0,7)].getPiece()=='knight' && board[clamp(a+1,0,7)][clamp(b-2,0,7)].getColor() != this.getTurn()) || (board[clamp(a-2,0,7)][clamp(b+1,0,7)].getPiece()=='knight' && board[clamp(a-2,0,7)][clamp(b+1,0,7)].getColor() != this.getTurn()) || (board[clamp(a-1,0,7)][clamp(b-2,0,7)].getPiece()=='knight' && board[clamp(a-1,0,7)][clamp(b-2,0,7)].getColor() != this.getTurn()) || (board[clamp(a-2,0,7)][clamp(b-1,0,7)].getPiece()=='knight' && board[clamp(a-2,0,7)][clamp(b-1,0,7)].getColor() != this.getTurn())){

      return true;
    }
    
    //if piece above
    if(b>0){
      for(let i = b-1; i>=0; i--){
        if(board[a][i].getColor()!='void'){
        
          if((board[a][i].getColor()!=this.getTurn()) && (board[a][i].getPiece()=='rook' || board[a][i].getPiece()=='queen')){

            return true;
          }
          else{
            i-=10;
          }
        
        }
      }
    }
    
    //if piece right
    if(a<7){
      for(let i = a+1; i<=7; i++){
        if(board[i][b].getColor()!='void'){
        
          if(
            (board[i][b].getColor()!=this.getTurn()) && 
            (board[i][b].getPiece()=='rook' || board[i][b].getPiece()=='queen')
          ){

            return true;
          }
          else{
            i+=10;
          }
        
        }      
      }
    }
    
    //if piece below
    if(b<7){
      for(let i = b+1; i<=7; i++){
        if(board[a][i].getColor()!='void'){
        
          if((board[a][i].getColor()!=this.getTurn()) && (board[a][i].getPiece()=='rook' || board[a][i].getPiece()=='queen')){

            return true;
          }
          else{
            i+=10;
          }
        
        }      
      }
    }
     
    //if piece left
    if(a>0){
      for(let i = a-1; i>=0; i--){
        if(board[i][b].getColor()!='void'){
        
          if((board[i][b].getColor()!=this.getTurn()) && (board[i][b].getPiece()=='rook' || board[i][b].getPiece()=='queen')){

            return true;
          }
          else{
            i-=10;
          }
        
        }      
      }
    }

    
    //add checks for when the for loop parameter leads the other parameter out of bounds!!
    
    let temp = b-1;
    //if piece above right
    if(a<7 && b>0){

      for(let i = a+1; i<=7; i++){
        if(board[i][clamp(temp,0,7)].getColor()!='void' && temp>=0 && temp<=7){
        
          if((board[i][clamp(temp,0,7)].getColor()!=this.getTurn()) && (board[i][clamp(temp,0,7)].getPiece()=='bishop' || board[i][clamp(temp,0,7)].getPiece()=='queen')){

            return true;
          }
          else{
            i+=10;
          }
        
        }
        temp--;
      }
    }

    //if piece below right
    if(a<7 && b<7){
      temp = b+1;
      for(let i = a+1; i<=7; i++){
        if(board[i][clamp(temp,0,7)].getColor()!='void' && temp>=0 && temp<=7){
        
          if((board[i][clamp(temp,0,7)].getColor()!=this.getTurn()) && (board[i][clamp(temp,0,7)].getPiece()=='bishop' || board[i][clamp(temp,0,7)].getPiece()=='queen')){
            
            return true;
          }
          else{
            i+=10;
          }
        
        } 
        temp++;
      }
    }

    //if piece below left
    if(a>0 && b<7){
      temp = b+1; 
      for(let i = a-1; i>=0; i--){
        if(board[i][clamp(temp,0,7)].getColor()!='void' && temp>=0 && temp<=7){
   
          if((board[i][clamp(temp,0,7)].getColor() != this.getTurn()) && (board[i][clamp(temp,0,7)].getPiece()=='bishop' || board[i][clamp(temp,0,7)].getPiece()=='queen')){
            return true;
          }
          else{
            i-=10;
          }
        
        }    
        temp++;
      }
    }
    
    //if piece above left
    if(a>0 && b>0){
      temp = b-1;
      for(let i = a-1; i>=0; i--){
        if(board[i][clamp(temp,0,7)].getColor()!='void' && temp>=0 && temp<=7){
        
          if((board[i][clamp(temp,0,7)].getColor()!=this.getTurn()) && (board[i][clamp(temp,0,7)].getPiece()=='bishop' || board[i][clamp(temp,0,7)].getPiece()=='queen')){

            return true;
          }
          else{
            i-=10;
          }
        
        }  
        temp--;
      }
    }

    //default return
    return false;
    
  }
  
  isInCheckmate(){
    
    //loops through all pieces on the board, checks if there is still check when moved to any square on the board. If there is no check after a single move, then it is not checkmate
    for(let i=0; i<this.getPieceList().length; i++){
      for(let j=0; j<this.getPieceList()[i].length; j++){
        
        if(this.getPieceList()[i][j].getColor() == this.getTurn()){
          
          for(let k=0; k<=7; k++){
            for(let l=0; l<=7; l++){
              
              
              if(this.isLegalMovement(this.getPieceList()[i][j], [k,l])){
                
                if(!(this.isInCheckNext(this.getPieceList()[i][j], [k,l]))){
                  return false;
                }
                
              }
              

              
            }
          }
          
        }
        
      }
    }
    console.log('checkmate');
    return true;
  }
  
  pawnPromotion(proPiece, squareB){
    //proPiece must be a Square of the promoted piece in the proper position
    this.removePiece(squareB[0], squareB[1]);
    this.removePiece(proPiece.getPos()[0], proPiece.getPos()[1]);
    this.addPiece(proPiece, squareB[0], squareB[1]);
    pawnPMenu = false;
    if(this.turn=='pwhite'){
      this.turn='black';
    }else if(this.turn=='pblack'){
      this.turn='white';
    }
  }
  
  pawnMenu(){
    noStroke();
    fill(110);
    square(200,280,80);
    square(120,360,80);
    fill(150);
    square(200,360,80);
    square(120,280,80);
    if(this.turn=='white' || this.turn=='pwhite'){
      this.turn='pwhite';
      image(whiteQueen, 120, 280, 80, 80);
      image(whiteKnight, 200, 280, 80, 80);
      image(whiteRook, 120, 360, 80, 80);
      image(whiteBishop, 200, 360, 80, 80);
    }
    if(this.turn=='black' || this.turn=='pblack'){
      this.turn='pblack';
      image(blackQueen, 120, 280, 80, 80);
      image(blackKnight, 200, 280, 80, 80);
      image(blackRook, 120, 360, 80, 80);
      image(blackBishop, 200, 360, 80, 80);
    }
  }
  
  doCastle(pieceA, squareB){
    if(squareB[0]==6 && squareB[1]==7){
      this.addPiece(new Square('white',[5,7],'rook'), 5, 7);
      this.removePiece(7,7);
    }else if(squareB[0]==2 && squareB[1]==7){
      this.addPiece(new Square('white',[3,7],'rook'), 3, 7);
      this.removePiece(0,7);
    }else if(squareB[0]==6 && squareB[1]==0){
      this.addPiece(new Square('black',[5,0],'rook'), 5, 0);
      this.removePiece(7,0);
    }else if(squareB[0]==2 && squareB[1]==0){
      this.addPiece(new Square('black',[3,0],'rook'), 3, 0);
      this.removePiece(0,0);
    }
    this.makeMove(pieceA, squareB);
    Board.lastMove([tempPiece.getPos()[0],tempPiece.getPos()[1]],[squareB[0], squareB[1]]);
    this.switchTurn();

  }
  
  enPassant(pieceA, squareB){
    if(this.turn=='white'){
      this.removePiece(squareB[0], squareB[1]+1);
    }else if(this.turn=='black'){
      this.removePiece(squareB[0], squareB[1]-1);
    }
    this.removePiece(pieceA.getPos()[0], pieceA.getPos()[1]);
    this.makeMove(pieceA, squareB);
    Board.lastMove([tempPiece.getPos()[0],tempPiece.getPos()[1]],[squareB[0], squareB[1]]);
    this.switchTurn();
  }
  
  makeMove(pieceA, squareB){
    let kingCoords = this.getKingCoords();
    if(squareB == kingCoords){
      return;
    }
    
    this.removePiece(pieceA.getPos()[0], pieceA.getPos()[1]);
    this.addPiece(new Square(pieceA.getColor(), squareB, pieceA.getPiece()), squareB[0], squareB[1]);
  }
  
  static lastMove(square1, square2){
    yellowSquares[0] = square1[0];
    yellowSquares[1] = square1[1];
    yellowSquares[2] = square2[0];
    yellowSquares[3] = square2[1];
  }
  
  resetBoard(){
    
    //default configuration for a game
    for(let i=0; i<8; i++){
      for(let j=0; j<8; j++){
        this.pieces[i][j] = new Square('void', [i,j], 'void');
      }
    }
    for(let i=0; i<8; i++){
      this.pieces[i][6] = new Square('white', [i,6], 'pawn');
    }
    for(let i=0; i<8; i++){
      this.pieces[i][1] = new Square('black', [i,1], 'pawn');
    }
    this.pieces[0][0] = new Square('black', [0,0], 'rook');
    this.pieces[0][0].allowCastle();
    this.pieces[7][0] = new Square('black', [7,0], 'rook');
    this.pieces[7][0].allowCastle();
    this.pieces[0][7] = new Square('white', [0,7], 'rook');
    this.pieces[0][7].allowCastle();
    this.pieces[7][7] = new Square('white', [7,7], 'rook');
    this.pieces[7][7].allowCastle();
    this.pieces[1][0] = new Square('black', [1,0], 'knight');
    this.pieces[6][0] = new Square('black', [6,0], 'knight');
    this.pieces[1][7] = new Square('white', [1,7], 'knight');
    this.pieces[6][7] = new Square('white', [6,7], 'knight');
    this.pieces[2][0] = new Square('black', [2,0], 'bishop');
    this.pieces[5][0] = new Square('black', [5,0], 'bishop');
    this.pieces[2][7] = new Square('white', [2,7], 'bishop');
    this.pieces[5][7] = new Square('white', [5,7], 'bishop');
    this.pieces[3][0] = new Square('black', [3,0], 'queen');
    this.pieces[3][7] = new Square('white', [3,7], 'queen');
    this.pieces[4][0] = new Square('black', [4,0], 'king');
    this.pieces[4][0].allowCastle();
    this.pieces[4][7] = new Square('white', [4,7], 'king');
    this.pieces[4][7].allowCastle();
  }
  
}

class Square {
  
  constructor(sqColor, sqLocation, piece){
    this.sqColor = sqColor;
    this.sqLocation = sqLocation;
    this.piece = piece;
    this.isDrag = false;
    this.canCastle = false;

  }
  
  display(){
    if(this.sqColor=='black'){
      switch(this.piece){
        case 'pawn':
          pieceImg = blackPawn;
        break;
        case 'knight':
          pieceImg = blackKnight;
        break;
        case 'bishop':
          pieceImg = blackBishop;
        break;
        case 'rook':
          pieceImg = blackRook;
        break;
        case 'queen':
          pieceImg = blackQueen;
        break;
        case 'king':
          pieceImg = blackKing;
        break;
        case 'void':
          pieceImg = voidPiece;
        break;
        
      }
    }
    else{
      switch(this.piece){
        case 'pawn':
          pieceImg = whitePawn;
        break;
        case 'knight':
          pieceImg = whiteKnight;
        break;
        case 'bishop':
          pieceImg = whiteBishop;
        break;
        case 'rook':
          pieceImg = whiteRook;
        break;
        case 'queen':
          pieceImg = whiteQueen;
        break;
        case 'king':
          pieceImg = whiteKing;
        break;
        case 'void':
          pieceImg = voidPiece;
        break;
      }
    }
    if(this.isDrag){
      image(pieceImg,mouseX-offDrag[0],mouseY-offDrag[1],80,80);
    }else{
      image(pieceImg,320 + 80*this.sqLocation[0],40 + this.sqLocation[1]*80,80,80);
    }
  }
  
  startDrag(){
    this.isDrag = true;
  }
  
  stopDrag(){
    this.isDrag = false;
  }
  
  getPiece(){
    return this.piece;
  }
  
  getColor(){
    return this.sqColor;
  }
  
  getPos(){
    return this.sqLocation;
  }
  
  setPosition(pos){
    this.sqLocation = pos;
  }
  
  allowCastle(){
    this.canCastle=true;
  }
  
  castle(){
    return this.canCastle;
  }
  
}

//input: [xpos, ypos] output: update in terms of board coordinates from 0-7 counted from top left corner
function getCoords(position){
  return [Math.floor((position[0] - 320)/80), Math.floor((position[1] - 40)/80)];
}

function mousePressed(){
  if(!pawnPMenu){
    
    dragPiece();
    
  }
 
}

function mouseReleased(){
  
  let xCoord = getCoords([mouseX, mouseY])[0];
  let yCoord = getCoords([mouseX, mouseY])[1];
  
  
  //pawn promotion stuff, tbh i forgot how it works and it looks too scary to try and fix up
  if(pawnPMenu){
    
    if(mainBoard.getTurn() == 'pwhite'){
      tempTurn = 'white'
    }else if(mainBoard.getTurn() =='pblack'){
      tempTurn = 'black';
    }
    
    if(mouseX>=120 && mouseX<200){
      if(mouseY>=280 && mouseY<360){
        mainBoard.pawnPromotion(new Square(tempTurn, pawnPCoords, 'queen'), pawnPCoords);
        Board.lastMove(oldCoords, pawnPCoords);
      }else if(mouseY>=360 && mouseY<420){
        mainBoard.pawnPromotion(new Square(tempTurn, pawnPCoords, 'rook'), pawnPCoords);
        Board.lastMove(oldCoords, pawnPCoords);
      }
    }else if(mouseX>=200 && mouseX <280){
      if(mouseY>=280 && mouseY<360){
        mainBoard.pawnPromotion(new Square(tempTurn, pawnPCoords, 'knight'), pawnPCoords);
        Board.lastMove(oldCoords, pawnPCoords);
      }else if(mouseY>=360 && mouseY<420){
        mainBoard.pawnPromotion(new Square(tempTurn, pawnPCoords, 'bishop'), pawnPCoords);
        Board.lastMove(oldCoords, pawnPCoords);
      }
    }
  }else{
    
    if(tempPiece.getColor() == 'white'){
      if(mainBoard.getTurn() == 'white'){

        tempPiece.stopDrag();
        isDrag = false;
        makingMove(xCoord, yCoord);
        
      }
    }else if(tempPiece.getColor() == 'black'){
      if(mainBoard.getTurn() != 'white'){
        
        tempPiece.stopDrag();
        isDrag = false;
        makingMove(xCoord, yCoord);
        
      }
    }
  }
  
}

function makingMove(xCoord, yCoord){
  
  switch(mainBoard.isLegalMove(tempPiece, [xCoord, yCoord])){
      
    case 'promotion':
      if(mainBoard.isLegalMove(tempPiece, [xCoord, yCoord])){
        pawnPMenu = true;
        pawnPCoords = [xCoord, yCoord];
        oldCoords = [tempPiece.getPos()[0],tempPiece.getPos()[1]];
      }
      break;
      
    case 'castle':
      if(mainBoard.isInCheckNext(tempPiece, [tempPiece.getPos()[0],tempPiece.getPos()[1]])){
        mainBoard.addPiece(tempPiece, tempPiece.getPos()[0], tempPiece.getPos()[1]);           
      }
      else{
        mainBoard.doCastle(tempPiece,[xCoord, yCoord]);
      }
      
      break;
      
    case 'en passant':
      mainBoard.enPassant(tempPiece,[xCoord, yCoord]);
      break;
      
    case true:
      mainBoard.makeMove(tempPiece, [xCoord, yCoord]);
      Board.lastMove([tempPiece.getPos()[0],tempPiece.getPos()[1]],[xCoord, yCoord]);
      mainBoard.switchTurn();
      break;
      
    default:
      mainBoard.addPiece(tempPiece, tempPiece.getPos()[0], tempPiece.getPos()[1]);
      
  }
  
  mainBoard.isInCheckmate();
  
}

function dragPiece(){
  
  let tempPList = mainBoard.getPieceList()
  let xVal = Math.floor((mouseX - 320)/80);
  let yVal = Math.floor((mouseY - 40)/80);
  tempPiece = tempPList[xVal][yVal];
  
  //makes sure that the piece selected is the person whose turn it is
  switch(tempPiece.getColor()){
      
      case('white'):
        if(mainBoard.getTurn() != 'white'){
          return;
        }
        break;
        
      case('black'):
        if(mainBoard.getTurn() != 'black'){
          return;
        }
        break;
        
  }
  
  mainBoard.removePiece(xVal,yVal);
  tempPiece.startDrag();
  offDrag = [mouseX - (xVal * 80 + 320), mouseY - (yVal * 80 +40)];
  isDrag = true;
  
  
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
