import { from, Observable, forkJoin } from 'rxjs';
import { map, pluck, switchMap } from 'rxjs/operators';
import axios from 'axios';
import { Repo, Repositories } from './models/repo';
import { Post, Comment } from './models/post';

const query = 'ndtnf-homeworks';

const githubRepo = from(axios.get(`https://api.github.com/search/repositories?q=${query}`))
  .pipe(
    pluck('data'),
    map(
      (response: Repositories) => response.items.map((repo: Repo) => {
        return {
          name: repo.name,
          url: repo.url
        };
      })
    ),
  );

githubRepo.subscribe({
  next: (value: Repo[]) => console.log(value),
  complete: () => console.log('Complete!'),
  error: (error) => console.log('Error!', error)
});

const posts = new Observable(
  observer => {
    axios.get('https://jsonplaceholder.typicode.com/posts').then((response) => {
      observer.next(response);
    }).catch((error) => observer.error(error.message));
    return () => {
      console.log('Success!');
    };
  }
)
  .pipe(
    pluck('data'),
    switchMap(
      (posts: Post[]) =>
        forkJoin(
          posts.map(
            (post) =>
            getCommets(post).pipe(
              map((comments) => ({
                ...post,
                comments
              }))
            )
          )
        ),
    )
  );

posts.subscribe({
  next: (value: any) => console.log(value),
  complete: () => console.log('Complete!'),
  error: (error) => console.log('Error!', error)
});

function getCommets(post): Observable<Comment[]> {
  return from(
    axios.get(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
  ).pipe(
    pluck('data')
  );
}