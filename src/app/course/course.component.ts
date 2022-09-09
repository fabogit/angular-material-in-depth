import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Course } from "../model/course";
import { CoursesService } from "../services/courses.service";
import { debounceTime, distinctUntilChanged, startWith, tap, delay, catchError, finalize } from 'rxjs/operators';
import { merge, fromEvent, throwError } from "rxjs";
import { Lesson } from '../model/lesson';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
	selector: 'course',
	templateUrl: './course.component.html',
	styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit, AfterViewInit {

	course: Course;
	lessons: Lesson[] = [];
	displayedColumns = ['select', 'seqNo', 'description', 'duration'];
	isLoading = false;
	expandedLesson: Lesson = null;
	selection = new SelectionModel<Lesson>(true, []);

	// grab first reference of type MatPaginator
	@ViewChild(MatPaginator)
	paginator: MatPaginator;

	@ViewChild(MatSort)
	sort: MatSort;

	loadLessonPage() {
		this.isLoading = true;
		this.coursesService.findLessons(
			this.course.id,
			this.sort?.direction ?? 'asc',
			this.paginator?.pageIndex ?? 0,
			this.paginator?.pageSize ?? 5,
			this.sort?.active ?? 'seqNo')
			.pipe(
				// assing response data to array
				tap(lessons => this.lessons = lessons),
				// handle error
				catchError(err => {
					console.log('Error loading lessons', err);
					alert('Error loading lessons');
					// return an empty observable or forward the error
					return throwError(err);
				}),
				// turn off loading spinner in any case
				finalize(() => this.isLoading = false)
			)
			.subscribe();
	}


	// selection column checkbox
	onLessonToggled(lesson: Lesson) {
		this.selection.toggle(lesson);
		console.log(this.selection.selected);
	}

	// row selection, expand extra rows
	onToggleLesson(lesson: Lesson) {
		if (lesson == this.expandedLesson) {
			this.expandedLesson = null;
		}
		else {
			this.expandedLesson = lesson;
		}
	}

	isAllSelected() {
		return this.selection.selected?.length == this.lessons?.length;
	}

	toggleAll() {
		if (this.isAllSelected()) {
			this.selection.clear();
		}
		else {
			this.selection.select(...this.lessons);
		}
	}

	constructor(private route: ActivatedRoute, private coursesService: CoursesService) {
	}

	ngOnInit() {
		this.course = this.route.snapshot.data["course"];
		this.loadLessonPage();
	}

	ngAfterViewInit() {
		// reset page when order change
		this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

		// afterViewInit hook beacause @ViewChild might not yet exist onInit, merge observables
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => this.loadLessonPage())
			)
			.subscribe();
	}



}
