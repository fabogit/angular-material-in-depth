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


@Component({
	selector: 'course',
	templateUrl: './course.component.html',
	styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit, AfterViewInit {

	course: Course;
	lessons: Lesson[] = [];
	displayedColumns = ['seqNo', 'description', 'duration'];
	isLoading = false;

	constructor(private route: ActivatedRoute, private coursesService: CoursesService) {
	}

	ngOnInit() {
		this.course = this.route.snapshot.data["course"];
		this.loadLessonPage();
	}

	ngAfterViewInit() {
	}

	loadLessonPage() {
		this.isLoading = true;
		this.coursesService.findLessons(this.course.id, 'asc', 0, 3)
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

}
