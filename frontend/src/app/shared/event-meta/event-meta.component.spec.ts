import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleMetaComponent } from './event-meta.component';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Event } from '../../core/models/event.model';

describe('ArticleMetaComponent', () => {
  let component: ArticleMetaComponent;
  let fixture: ComponentFixture<ArticleMetaComponent>;

  let mockArticle: Event;

  beforeEach(() => {
    mockArticle = {
      slug: 'test',
      title: 'Test',
      description: 'Test',
      body: 'Test',
      tagList: [] as string[],
      favorited: false,
      favoritesCount: 0,
      author: {
        username: 'test',
        bio: 'test',
        image: 'test',
        following: false
      }
    } as Event;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        ArticleMetaComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleMetaComponent);
    component = fixture.componentInstance;
    component.article = mockArticle;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
