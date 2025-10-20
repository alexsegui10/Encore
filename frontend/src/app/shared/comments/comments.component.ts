import { Component, signal, ChangeDetectionStrategy, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { EventService } from '../../core/services/event.service';
import { EventComment } from '../../core/models/comments.model';
import { JwtService } from '../../core/services/jwt.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsComponent implements OnInit, OnDestroy {
  slug!: string;

  newCommentControl = new FormControl<string>('', { nonNullable: true });
  comments = signal<EventComment[]>([]);
  posting = signal(false);
  deletingId = signal<string | null>(null);

  hasToken = computed(() => !!this._jwt.getToken());

  currentUserId = signal<string | null>(null);
  currentUserEmail = signal<string | null>(null);
  private sub?: Subscription;

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _eventService: EventService,
    private readonly _jwt: JwtService,
    private readonly _userService: UserService
  ) {}

  ngOnInit(): void {
    this.slug = this._activatedRoute.snapshot.params['slug'];
    this._loadComments();

    this.sub = this._userService.currentUser$.subscribe(u => {
      const id = (u as any)?._id ?? (u as any)?.id ?? null;
      const email = (u as any)?.email ?? null;
      this.currentUserId.set(id);
      this.currentUserEmail.set(email);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private _loadComments(): void {
    this._eventService.getEventComments(this.slug).subscribe({
      next: res => this.comments.set(res.comments ?? []),
      error: () => this.comments.set([]),
    });
  }

  addComment(): void {
    const body = this.newCommentControl.value.trim();
    if (!body) return;

    this.posting.set(true);
    this._eventService.createEventComment(this.slug, body).subscribe({
      next: res => {
        this.comments.update(cs => [res.comment, ...cs]);
        this.newCommentControl.setValue('');
      },
      error: err => console.error('Error creando comentario', err),
      complete: () => this.posting.set(false),
    });
  }

  deleteComment(id: string): void {
    const c = this.comments().find(x => x.id === id);
    if (!c || !this.isMine(c)) return;

    this.deletingId.set(id);
    this._eventService.deleteEventComment(this.slug, id).subscribe({
      next: () => this.comments.update(cs => cs.filter(c => c.id !== id)),
      error: err => console.error('Error eliminando comentario', err),
      complete: () => this.deletingId.set(null),
    });
  }

  isMine(comment: EventComment): boolean {
    const myId = this.currentUserId();
    const myEmail = this.currentUserEmail();
    const authorId = comment.author?.id ?? null;
    const authorEmail = (comment as any)?.author?.email ?? null;

    return (!!myId && !!authorId && String(authorId) === String(myId))
        || (!!myEmail && !!authorEmail && String(authorEmail).toLowerCase() === String(myEmail).toLowerCase());
  }

  trackById = (_: number, c: EventComment) => c.id;
}
