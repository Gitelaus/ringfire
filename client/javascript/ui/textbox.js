let Container = createjs.Container;

class TextBox extends Container{
    constructor(options){
        super();
        if(!options){
            options = {};
        }

        this.placeholder = options.placeholder

        this.focused = false;

        this.ui = {};

        this.setup();
    }

    setup(){
        var _shape = new createjs.Shape();
        _shape.set({width:(this.width || 250), height:(this.height || 40)});
        this.setBounds(0, 0, _shape.width, _shape.height);
        this.addChild(_shape);

        var graphics = _shape.graphics;
        graphics.setStrokeStyle(1.5).beginStroke('#000000').beginFill('#FFFFFF').drawRect(this.x, this.y, _shape.width, _shape.height);
        
        this.ui._uiText = new createjs.Text(this.placeholder, "22px Verdana", "#000000");
        this.ui._uiText.set({
            x:this.x + 4,
            y:this.y + 6
        });
        
        this.addChild(this.ui._uiText)


        this.on('mousedown', this.onclick);
        this.on('added', () => {
            this.parent.on('stagemousedown', (event) => {
               this.setFocus(false);
            })
        });

        document.addEventListener('keydown', (event) => {
            if(!this.focused)return;
            if(event.key.length > 1){
                if(event.key == "Backspace"){
                    this.ui._uiText.text = this.ui._uiText.text.substring(0, this.ui._uiText.text.length - 1);
                }
                return;
            }
            this.ui._uiText.text += event.key;
        });
    }


    setText(text){
        this.ui._uiText.set({text:text});
        if(text == this.placeholder){
            this.ui._uiText.alpha = 0.7;
        }else{
            this.ui._uiText.alpha = 1;
        }
    }

    setFocus(focus){
        this.focused = focus;
        console.log(focus);
        if(focus){
            if(this.ui._uiText.text == this.placeholder){
                this.setText("");
            }
        }else{
            if(this.ui._uiText.text == ""){
                this.setText(this.placeholder);
            }
        }
    }

    onclick(event){
        this.setFocus(true);
        if(this.ui._uiText.text == this.placeholder){
            this.setText("");
        }
    }

    

    handleComplete() {
        this.dispatchEvent('animationEnd');
    }
}
createjs.promote(TextBox, "Container");

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}