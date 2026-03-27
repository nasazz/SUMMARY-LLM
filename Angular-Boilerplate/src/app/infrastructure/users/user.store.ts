import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { inject } from '@angular/core';
import { UserService } from './user.service';
import { UserDto, SupervisorGroupDto, UserHierarchyResponse } from '../../domain/dtos/user.dto';

interface UserState {
    users: UserDto[];
    schedulableUsers: any[];
    hierarchy: UserHierarchyResponse | null;
    isLoading: boolean;
    error: string | null;
}
  
const initialState: UserState = {
    users: [],
    schedulableUsers: [],
    hierarchy: null,
    isLoading: false,
    error: null
};

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withMethods((store, userService = inject(UserService)) => ({

        loadAllUsers: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                    switchMap(() =>
                    userService.getAllUsers().pipe(
                        tapResponse({
                            next: (response) => {
                                console.log('API Response:', response);
                                patchState(store, { users: response.data, isLoading: false });
                            },
                            error: (err: any) => {
                                console.error('API Error:', err);
                                patchState(store, { error: 'Failed to load users', isLoading: false });
                            },
                        })
                    )
                )
            )
        ),

        loadHierarchy: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isLoading: true, error: null })),
                switchMap(() =>
                    userService.getHierarchy().pipe(
                        tapResponse({
                            next: (hierarchy) => {
                                console.log('Hierarchy Response:', hierarchy);
                                patchState(store, { hierarchy, isLoading: false });
                            },
                            error: (err: any) => {
                                console.error('Hierarchy Error:', err);
                                patchState(store, { error: 'Failed to load hierarchy', isLoading: false });
                            },
                        })
                    )
                )
            )
        ),

        approveUser: rxMethod<string>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap((id) =>
                    userService.approveUser(id).pipe(
                        tapResponse({
                            next: () => {
                                // Optimistic Update: Change status to Active
                                patchState(store, {
                                    users: store.users().map(u =>
                                        u.id === id ? { ...u, status: 'Active', isActive: true } : u
                                    ),
                                    isLoading: false
                                });
                            },
                            error: (err: any) => patchState(store, { error: 'Failed to approve user', isLoading: false }),
                        })
                    )
                )
            )
        ),

        rejectUser: rxMethod<string>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap((id) =>
                    userService.rejectUser(id).pipe(
                        tapResponse({
                            next: () => {
                                // Optimistic Update: Change status to Rejected
                                patchState(store, {
                                    users: store.users().map(u =>
                                        u.id === id ? { ...u, status: 'Rejected', isActive: false } : u
                                    ),
                                    isLoading: false
                                });
                            },
                            error: (err: any) => patchState(store, { error: 'Failed to reject user', isLoading: false }),
                        })
                    )
                )
            )
        ),

        updateUser: rxMethod<{ id: string, data: any }>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(({ id, data }) =>
                    userService.updateUser(id, data).pipe(
                        tapResponse({
                            next: () => {
                                patchState(store, {
                                    users: store.users().map(u =>
                                        u.id === id ? { ...u, ...data } : u
                                    ),
                                    isLoading: false
                                });
                            },
                            error: (err: any) => patchState(store, { error: 'Failed to update user', isLoading: false }),
                        })
                    )
                )
            )
        ),

        loadSchedulableUsers: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isLoading: true })),
                switchMap(() => userService.getSchedulableUsers().pipe(
                    tapResponse({
                        next: (res) => patchState(store, { schedulableUsers: res, isLoading: false }),
                        error: (err) => patchState(store, { error: 'Failed to load schedulable users', isLoading: false })
                    })
                ))
            )
        )

    }))
);

