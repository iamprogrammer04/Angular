import { Component, OnInit } from '@angular/core';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TranslateService } from '@ngx-translate/core';
import { FormComponent } from '../form/form.component';
import { PeriodicElement, TablesDataService } from 'app/routes/tables/data.service';
import { Users } from '@core/models/system/users/users.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [TablesDataService],
})
export class MainComponent implements OnInit {
  searchStr = '';
  columns: MtxGridColumn[] = [
    {
      header: this.translate.stream('usersManager.position'),
      field: 'position',
      sortable: true,
      minWidth: 100,
      width: '100px',
    },
    {
      header: this.translate.stream('usersManager.jobTitle'),
      field: 'title',
      sortable: true,
      minWidth: 100,
    },
    {
      header: this.translate.stream('usersManager.userName'),
      field: 'userName',
      sortable: true,
      disabled: true,
      minWidth: 100,
    },
    {
      header: this.translate.stream('usersManager.fullName'),
      field: 'fullName',
      minWidth: 100,
    },
    {
      header: this.translate.stream('usersManager.email'),
      field: 'email',
      minWidth: 100,
    },
    {
      header: this.translate.stream('usersManager.roles'),
      field: 'roles',
      minWidth: 100,
    },
    {
      header: this.translate.stream('usersManager.phoneNumber'),
      field: 'phoneNumber',
      hide: true,
      minWidth: 120,
    },
    {
      header: this.translate.stream('system.operation'),
      field: 'operation',
      minWidth: 140,
      width: '140px',
      pinned: 'right',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          tooltip: this.translate.stream('system.edit'),
          click: record => this.openAddEditUsersDialog(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: this.translate.stream('system.delete'),
          pop: {
            title: this.translate.stream('system.confirm_delete'),
            closeText: this.translate.stream('system.close'),
            okText: this.translate.stream('system.ok'),
          },
          click: record => this.delete(record),
        },
      ],
    },
  ];
  list: PeriodicElement[] = [];
  dataMain: PeriodicElement[] = [];
  isLoading = true;
  hideRowSelectionCheckbox = false;
  showToolbar = true;
  columnHideable = true;
  columnSortable = true;
  columnPinnable = true;
  rowHover = false;
  rowStriped = false;
  showPaginator = true;
  expandable = false;
  columnResizable = false;

  constructor(
    private translate: TranslateService,
    private dataSrv: TablesDataService,
    private dialog: MtxDialog
  ) { }

  ngOnInit() {
    this.getData();
    this.isLoading = false;
  }

  openAddEditUsersDialog(value?: Users) {
    const dialogRef = this.dialog.originalOpen(FormComponent, {
      width: '900px',
      disableClose: true,
      data: { value },
    });

    dialogRef.afterClosed().subscribe({
      next: val => {
        if (val) {
          // this.getEmployeeList();
        }
      },
    });
  }

  getData() {
    this.list = this.dataSrv.getData();
    this.dataMain = this.list;
  }

  search() {
    if (this.searchStr === '') {
      // Nếu searchTerm rỗng, trả về toàn bộ danh sách
      return (this.list = this.dataMain);
    }
    this.list = this.dataMain.filter(item => {
      return Object.values(item).some(value =>
        value.toString().toLowerCase().includes(this.searchStr.toLowerCase())
      );
    });
    return this.list;
  }

  clearInputSearch() {
    this.searchStr = '';
    this.search();
  }
  onInputChange() {
    this.search();
  }

  delete(value: any) {
    this.dialog.alert(`You have deleted ${value.position}!`);
  }

  changeSelect(e: any) {
    console.log(e);
  }

  changeSort(e: any) {
    console.log(e);
  }

  enableRowExpandable() {
    this.columns[0].showExpand = this.expandable;
  }
}
