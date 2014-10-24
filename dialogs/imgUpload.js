(function(CKEDITOR){
    var yf = require('yf'),
        Dropzone = require('dropzone'),
        _ = require("underscore"),
        myDropzone,
        successInfo,
        aRatio,
        locked,
        tWidth;
    CKEDITOR.dialog.add( 'imgUpload', function( editor ) {
        return {
            title: '插入图片',
            minWidth: 400,
            minHeight: 200,

            contents: [
            {
                id: 'tab-img-insert',
                label: '插入图片',
                elements: [{
                         type:'hbox',
                         children:[{
                              type: 'text',
                              id: 'img_src',
                              style: '',
                              label: '外部图片链接',
                              setup: function($element) {
                                  this.setValue($element.attr('src'));
                              },
                              commit: function($element) {
                                  $element.attr('data-img-url', this.getValue());
                                  $element.attr('data-cke-saved-src', this.getValue());
                                  $element.attr('src', this.getValue());
                                  // $element.attr('title', img.title);
                              }
                       }]},
                       {
                         type:'hbox',
                         children:[
                             {
                                 type: 'text',
                                 id: 'img_width',
                                 label:'宽度',
                                 style: '',
                                 setup: function($element) {
                                  var width = parseInt($element.css('width'));
                                  this.setValue(width);
                                 },
                                 commit: function($element){
                                    var width = this.getValue();
                                    if(width)
                                      $element.css('width',width);
                                 }
                             },
                             {
                                 type: 'text',
                                 id: 'img_height',
                                 label:'高度',
                                 style: '',
                                 setup: function($element) {
                                  var height = parseInt($element.css('height'));
                                  this.setValue(height);
                                 },
                                 commit: function($element){
                                    var height = this.getValue();
                                    if(height)
                                      $element.css('height',height);
                                 }
                             },
                             {
                                id: 'ratioLock',
                                type: 'html',
                                style: 'margin-top:19px;width:40px;height:40px;',
                                onLoad: function() {
                                  // Activate Reset button
                                  var resetButton = CKEDITOR.document.getById( 'reset_wh' ),
                                    ratioButton = CKEDITOR.document.getById( 'locked_wh' );
                                  if ( resetButton ) {
                                    resetButton.on( 'click', function( evt ) {
                                      resetSize( this );
                                      evt.data && evt.data.preventDefault();
                                    }, this.getDialog() );
                                    resetButton.on( 'mouseover', function() {
                                      this.addClass( 'cke_btn_over' );
                                    }, resetButton );
                                    resetButton.on( 'mouseout', function() {
                                      this.removeClass( 'cke_btn_over' );
                                    }, resetButton );
                                  }
                                  // Activate (Un)LockRatio button
                                  if ( ratioButton ) {
                                    locked = true;
                                    ratioButton.on( 'click', function( evt ) {
                                      locked = switchLockRatio( this );
                                      var width = this.getValueOf( 'tab-img-insert', 'img_width' );
                                      // if ( oImageOriginal.getCustomData( 'isReady' ) == 'true' && width ) {
                                      //   var height = oImageOriginal.$.height / oImageOriginal.$.width * width;
                                      //   if ( !isNaN( height ) ) {
                                      //     this.setValueOf( 'tab-img-insert', 'img_height', Math.round( height ) );
                                      //   }
                                      // }
                                      evt.data && evt.data.preventDefault();
                                    }, this.getDialog() );
                                    ratioButton.on( 'mouseover', function() {
                                      this.addClass( 'cke_btn_over' );
                                    }, ratioButton );
                                    ratioButton.on( 'mouseout', function() {
                                      this.removeClass( 'cke_btn_over' );
                                    }, ratioButton );
                                  }
                                },
                                html: '<div>' +
                                  '<a href="javascript:void(0)" tabindex="-1" title="保持比例" class="cke_btn_locked" id="locked_wh" aria-checked="true" role="checkbox"><span class="cke_icon"></span><span class="cke_label">锁定比例</span></a>' +
                                  '<a href="javascript:void(0)" tabindex="-1" title="重新设置" class="cke_btn_reset" id="reset_wh" role="button"><span class="cke_label">重新设置</span></a>' +
                                  '</div>'
                              },
                             {
                                 type: 'select',
                                 id: 'img_float',
                                 label:'对齐设置',
                                 style: '',
                                 items: [
                                          [ '没有设置', '' ],
                                          [ '左对齐', 'left' ],
                                          [ '右对齐', 'right' ]
                                        ],
                                 setup: function($element) {
                                 var value = $element.css( 'float' );
                                  switch ( value ) {
                                    // Ignore those unrelated values.
                                    case 'inherit':
                                    case 'none':
                                      value = '';
                                  }

                                  !value && ( value = ( $element.css( 'align' ) || '' ).toLowerCase() );
                                  this.setValue( value );
                                 },
                                 commit: function($element,img){
                                    var value = this.getValue();
                                    if ( value )
                                      $element.css( 'float', value );
                                    else
                                      $element.css( 'float','' );
                                 }
                             }           
                        ]
                },
                       {
                         type:'hbox',
                         children:[
                             {
                                 type: 'html',
                                 id: 'htmlPreview',
                                 style: 'width:100%;',
                                 html: '<div class="img-prviewer"></div>'
                             }          
                        ]
                }]
            }
            ,{
                id: 'tab-img-upload',
                label: '上传图片',
                elements: [{
                         type:'hbox',
                         children:[{
                              type: 'html',
                              id: 'img_url',
                              style: '',
                              label: '视频链接地址(目前只支持优酷视频)',
                              html: '<div style="width:162px;height:180px;margin:10px auto;background:#e4e6e9;" class="dropzone"><input class="hide" type="file"></div>'
                              // setup: function($element) {
                              //     this.setValue($element.attr('data-img-url'));
                              // },
                              // commit: function($element, video) {
                              //     $element.attr('data-video-url', this.getValue());
                              //     $element.attr('data-video-id', video.id);
                              //     $element.attr('data-video-thumbnail-url', video.thumbnail_url);
                              //     $element.attr('data-cke-saved-src', video.thumbnail_url);
                              //     $element.attr('src', video.thumbnail_url);
                              //     $element.attr('title', video.title);
                              //     $element.attr('data-img-id', '');
                              // }
                       }]
                     }]
            }],
            
            onShow: function(){
                var self = this, 
                    selection = editor.getSelection(),
                    $element = $(selection.getStartElement().$),
                    okButton = this._.buttons.ok.id;
                    this._previewVideo = previewVideo;
                if($element.closest('img.insert-img').length){
                    this.insertMode = false;
                    this.$element = $element;
                    this.setupContent($element);
                    var imgInfo = {
                        id: $element.attr('data-img-id'),
                        url:  $element.attr('src'),
                        title: $element.attr('title')
                    },
                       imgStyle = {
                           width: $element.css('width'),
                           height: $element.css('height')
                       };
                    self._previewVideo(imgInfo,imgStyle);
                }else{
                    this.insertMode = true;
                    
                }
                
                var urlInput = this.getContentElement('tab-img-insert','img_src'),
                    widthInput = this.getContentElement('tab-img-insert','img_width'),
                    heightInput = this.getContentElement('tab-img-insert','img_height'),
                    nuploads = 0;
                aRatio = (+this.getValueOf('tab-img-insert','img_width')) / (+this.getValueOf('tab-img-insert','img_height'));
                tWidth = this.getValueOf('tab-img-insert','img_width');
                myDropzone = new Dropzone('.dropzone', {
                  url: "/api/v2/ckupload",
                  maxFiles: 1,
                  dictDefaultMessage :'<span>请将<b>上传图片</b>拖到此处</span><br/>(或者点击上传)<br/>',
                  acceptedFiles: 'image/jpg,image/png,image/gif,image/jpeg',
                  success: _.bind(uploadSuccess,this)
                });
                myDropzone.on('maxfilesexceeded',function(file){
                  console.log(file);
                  this.removeAllFiles();
                  this.addFile(file);
                  $(this.element).find('.dz-message').addClass('hide');
                })
                $('#'+urlInput.domId).on('change',function(e){
                    var url = self.getValueOf('tab-img-insert', 'img_src');
                    var backHtml = self._previewVideo(url);

                    var i = new Image();
                    i.onload = function(){
                      var $prevImg = backHtml.find('img');
                      var height = parseInt($prevImg.css('height')) + '',
                          width = parseInt($prevImg.css('width')) + '';
                      var imgStyle = $prevImg.attr('style') + 'width:' + width + 'px;height:' + height + 'px;';
                      $prevImg.attr('style',imgStyle);
                      aRatio = width/height;
                      tWidth = width;
                          self.setValueOf('tab-img-insert','img_width',width);
                          self.setValueOf('tab-img-insert','img_height',height);
                          self.enableButton(okButton);  
                    }
                    i.src = url;
                });
                $('#'+widthInput.domId).on('change',function(e){
                    var width = self.getValueOf('tab-img-insert', 'img_width');
                    var $previewImg = $('#' + self.getContentElement('tab-img-insert','htmlPreview').domId);
                    var $viewImg = $previewImg.find('.img-info img');
                    $viewImg.css('width',width + 'px');
                    if(locked){
                      var height = (+width) / aRatio + '';
                      self.setValueOf('tab-img-insert', 'img_height',height);
                      $viewImg.css('height',height + 'px');
                    }
                });
                $('#'+heightInput.domId).on('change',function(e){
                    var height = self.getValueOf('tab-img-insert', 'img_height');
                    var $previewImg = $('#' + self.getContentElement('tab-img-insert','htmlPreview').domId);
                    var $viewImg = $previewImg.find('.img-info img');
                    $viewImg.css('height',height + 'px');
                    if(locked){
                      var width = (+height) * aRatio + '';
                      self.setValueOf('tab-img-insert', 'img_width',width);
                      $viewImg.css('width',width + 'px');
                    }
                });
               clearPreview(self);
            },
            
              
            onOk: function() {
                var self = this;
                var insertUrl = this.getValueOf( 'tab-img-insert', 'img_src' ),
                    imgWidth = this.getValueOf( 'tab-img-insert', 'img_width' ),
                    imgHeight = this.getValueOf( 'tab-img-insert', 'img_height' ),
                    imgPos = imgHeight = this.getValueOf( 'tab-img-insert', 'img_float' );
                if(this.insertMode){
                    
                    if(insertUrl){
                      var phoneHtml = '<img class="insert-img" data-img-id=""\
                      data-img-url="'+ insertUrl + '"\
                      style="width:' + imgWidth + 'px;height:' + imgHeight + 'px;float:' + imgPos + '"\
                      src="' + insertUrl + '">';
                      editor.insertHtml(phoneHtml);
                      clearPreview(self);
                      return;
                    }
                    // if( typeof successInfo != "undefined"){
                    //   var phoneHtml = '<img class="insert-img" data-img-id=""\
                    //   data-img-url="'+ insertUrl + '"\
                    //   style="width:' + successInfo.width + 'px;height:' + successInfo.height + 'px;"\
                    //   title="' + successInfo.name + '"\
                    //   src="' + insertUrl + '">'
                    // }
                    clearPreview(self);
                }else{
                    this.commitContent(this.$element);
                    clearPreview(self);
                }
            }
            
        };
    });
    var previewVideo = function(url,style) {
            var style = style || {width:'auto',height:'auto'}
            var html = videoPreviewerTemplate(url,style);
            var $previewer = $('#' + this.getContentElement('tab-img-insert','htmlPreview').domId),
                $info = $previewer.find('.img-info');
            if ($info.length) {
                $info.replaceWith(html);
                return $previewer.find('.img-info');;
            } else {
                return $previewer.append(html);
            }
        },
        videoPreviewerTemplate = function(url,style) {
          if(typeof url == "string"){
            return '<div class="img-info">\
                <div class="thumbnailWrapper" style="text-align:center;">\
                    <img style="max-width:400px;max-height:400px;" src="' + url + '"/>\
                </div>\
            </div>';
          }
            return '<div class="img-info">\
                <div class="thumbnailWrapper" style="text-align:center;">\
                    <img style="max-width:400px;max-height:400px;width:' + style.width + ';height:' + style.height + '" src="' + url.url + '"/>\
                </div>\
            </div>';
        },
        clearPreview = function(target){
            target.getButton(target._.buttons.cancel.id).on('click',function(){
                myDropzone.removeAllFiles();
                $('#' + target.getContentElement('tab-img-insert','htmlPreview').domId).html('');
            });
            target.getButton(target._.buttons.ok.id).on('click',function(){
                myDropzone.removeAllFiles();
                $('#' + target.getContentElement('tab-img-insert','htmlPreview').domId).html('');
            });
        },
        uploadSuccess = function(file,data){
          var okButton = this._.buttons.ok.id,
              urlTab = this.getContentElement('tab-img-insert','tab-img-insert');
          successInfo = {
            url: data.url,
            name: file.name,
            width: file.width,
            height: file.height
          };
          this.setValueOf('tab-img-insert','img_src',data.url);
          this.setValueOf('tab-img-insert','img_width',file.width);
          this.setValueOf('tab-img-insert','img_height',file.height);
          this.selectPage('tab-img-insert');
        },
        addedImg = function(file){
          console.log(this);
        },
        resetSize = function( dialog ) {
            var widthField = dialog.getContentElement( 'tab-img-insert', 'img_width' ),
                heightField = dialog.getContentElement( 'tab-img-insert', 'img_height' ),
                url = dialog.getValueOf( 'tab-img-insert', 'img_src' );
            widthField && widthField.setValue( tWidth );
            heightField && heightField.setValue( tWidth / aRatio );
            dialog._previewVideo({url:url},{width: tWidth + 'px',height: tWidth / aRatio + 'px'});
        },
        switchLockRatio = function( dialog ) {
          var ratioButton = CKEDITOR.document.getById( 'locked_wh' );
          dialog.lockRatio = ratioButton.getAttribute('aria-checked');
          if ( dialog.lockRatio == 'true'){
            ratioButton.addClass( 'cke_btn_unlocked' );
            dialog.lockRatio = false;
          }else{
            ratioButton.removeClass( 'cke_btn_unlocked' );
            dialog.lockRatio = true;
          }
          ratioButton.setAttribute( 'aria-checked', dialog.lockRatio );

          // Ratio button hc presentation - WHITE SQUARE / BLACK SQUARE
          // if ( CKEDITOR.env.hc ) {
          //   var icon = ratioButton.getChild( 0 );
          //   icon.setHtml( dialog.lockRatio ? CKEDITOR.env.ie ? '\u25A0' : '\u25A3' : CKEDITOR.env.ie ? '\u25A1' : '\u25A2' );
          // }

          return dialog.lockRatio;
        };
})(CKEDITOR)
