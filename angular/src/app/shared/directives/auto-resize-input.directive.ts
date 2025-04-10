import {
    Directive,
    ElementRef,
    HostListener,
    AfterViewInit,
    Renderer2
  } from '@angular/core';
  
  @Directive({
    standalone: false,
    selector: '[appAutoResizeInput]'
  })
  export class AutoResizeInputDirective implements AfterViewInit {
    private ghostSpan: HTMLSpanElement;
  
    constructor(private el: ElementRef<HTMLInputElement>, private renderer: Renderer2) {
      this.ghostSpan = this.renderer.createElement('span');
      this.renderer.setStyle(this.ghostSpan, 'visibility', 'hidden');
      this.renderer.setStyle(this.ghostSpan, 'position', 'absolute');
      this.renderer.setStyle(this.ghostSpan, 'white-space', 'pre');
      this.renderer.appendChild(document.body, this.ghostSpan);
    }
  
    ngAfterViewInit(): void {
      this.resize();
    }
  
    @HostListener('input')
    onInput() {
      this.resize();
    }
  
    private resize() {
      const input = this.el.nativeElement;
      const computedStyle = window.getComputedStyle(input);
  
      this.ghostSpan.textContent = input.value || input.placeholder || '';
  
      this.renderer.setStyle(this.ghostSpan, 'font', computedStyle.font);
      this.renderer.setStyle(this.ghostSpan, 'fontSize', computedStyle.fontSize);
      this.renderer.setStyle(this.ghostSpan, 'fontFamily', computedStyle.fontFamily);
  
      const width = this.ghostSpan.offsetWidth + 10; // padding cho thoáng
      this.renderer.setStyle(input, 'width', `${width}px`);
    }
  }
  