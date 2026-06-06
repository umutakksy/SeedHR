using MongoDB.Driver;
using SeedHR.Backend.Models.Entities;
using SeedHR.Backend.Security.Authentication;
using System;
using System.Collections.Generic;

namespace SeedHR.Backend.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IMongoDbContext context, IPasswordHasher passwordHasher)
    {
        // Skip seeding if database already has users
        var hasUsers = await context.Users.Find(_ => true).AnyAsync();
        if (hasUsers)
        {
            Console.WriteLine("[SEED] Database already contains users. Skipping seeding to prevent data loss.");
            return;
        }

        // Force drop/clear collections to ensure clean seed
        await context.Users.DeleteManyAsync(_ => true);
        await context.Departments.DeleteManyAsync(_ => true);
        await context.Positions.DeleteManyAsync(_ => true);
        await context.Roles.DeleteManyAsync(_ => true);
        await context.Announcements.DeleteManyAsync(_ => true);
        await context.Attendances.DeleteManyAsync(_ => true);
        await context.LeaveRequests.DeleteManyAsync(_ => true);
        await context.LeaveTypes.DeleteManyAsync(_ => true);
        await context.LeaveBalances.DeleteManyAsync(_ => true);
        await context.PerformanceEvaluations.DeleteManyAsync(_ => true);
        await context.JobPostings.DeleteManyAsync(_ => true);
        await context.Candidates.DeleteManyAsync(_ => true);
        await context.CandidateApplications.DeleteManyAsync(_ => true);
        await context.Interviews.DeleteManyAsync(_ => true);
        await context.WorkSchedules.DeleteManyAsync(_ => true);
        await context.Courses.DeleteManyAsync(_ => true);
        await context.CourseAssignments.DeleteManyAsync(_ => true);
        await context.CompetencyForms.DeleteManyAsync(_ => true);
        await context.Evaluations360.DeleteManyAsync(_ => true);
        await context.ReferenceChecks.DeleteManyAsync(_ => true);
        await context.Payrolls.DeleteManyAsync(_ => true);
        await context.ExpenseRequests.DeleteManyAsync(_ => true);
        await context.EmployeeShifts.DeleteManyAsync(_ => true);
        await context.VisitorLogs.DeleteManyAsync(_ => true);

        // 1. Seed Roles
        var roles = new List<Role>
        {
            new Role { Id = "role_admin", Name = "Admin", Description = "Sistem Yöneticisi", CreatedAt = DateTime.UtcNow },
            new Role { Id = "role_manager", Name = "Manager", Description = "Yönetici", CreatedAt = DateTime.UtcNow },
            new Role { Id = "role_hr", Name = "HR", Description = "İnsan Kaynakları", CreatedAt = DateTime.UtcNow },
            new Role { Id = "role_employee", Name = "Employee", Description = "Çalışan", CreatedAt = DateTime.UtcNow }
        };
        await context.Roles.InsertManyAsync(roles);

        // 2. Seed Departments
        var depts = new List<Department>
        {
            new Department { Id = "dept_yon", Name = "Yönetim", Code = "YON", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_ik", Name = "İnsan Kaynakları", Code = "IK", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_fin", Name = "Finans & Muhasebe", Code = "FIN", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_it", Name = "Bilgi Teknolojileri", Code = "IT", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_sat", Name = "Satış", Code = "SAT", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_paz", Name = "Pazarlama", Code = "PAZ", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_op", Name = "Operasyon", Code = "OP", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_idari", Name = "İdari İşler & Satın Alma", Code = "IDA", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_guv", Name = "Güvenlik", Code = "GUV", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = "dept_temizlik", Name = "Temizlik & Destek", Code = "TEM", IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        await context.Departments.InsertManyAsync(depts);

        // 3. Seed Positions
        var positions = new List<Position>
        {
            new Position { Id = "pos_gm", Title = "Genel Müdür", Code = "GM", DepartmentId = "dept_yon", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_ik_mudur", Title = "İK Müdürü", Code = "IKM", DepartmentId = "dept_ik", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_ik_uzmani", Title = "İK Uzmanı", Code = "IKU", DepartmentId = "dept_ik", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_bt_mudur", Title = "BT Müdürü", Code = "BTM", DepartmentId = "dept_it", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_yazilim_uzmani", Title = "Kıdemli Yazılım Geliştirici", Code = "SWE", DepartmentId = "dept_it", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_muhasebe_uzmani", Title = "Muhasebe Uzmanı", Code = "MUH", DepartmentId = "dept_fin", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_satis_temsilcisi", Title = "Satış Temsilcisi", Code = "SAT", DepartmentId = "dept_sat", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_paz_uzmani", Title = "Pazarlama Uzmanı", Code = "PAZ", DepartmentId = "dept_paz", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_op_uzmani", Title = "Operasyon Uzmanı", Code = "OPU", DepartmentId = "dept_op", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_idari_uzmani", Title = "İdari İşler Sorumlusu", Code = "IDA", DepartmentId = "dept_idari", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_guvenlik_gorevlisi", Title = "Güvenlik Görevlisi", Code = "GUV", DepartmentId = "dept_guv", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Position { Id = "pos_destek_elemani", Title = "Temizlik & Destek Sorumlusu", Code = "TEM", DepartmentId = "dept_temizlik", IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        await context.Positions.InsertManyAsync(positions);

        // 4. Seed Users
        var hash = passwordHasher.Hash("adalarsahili@@##");
        var ikHash = passwordHasher.Hash("hr1234");
        var empHash = passwordHasher.Hash("employee");
        var managerHash = passwordHasher.Hash("manager");

        var users = new List<User>
        {
            new User
            {
                Id = "user_admin",
                Email = "admin",
                PasswordHash = hash,
                FirstName = "Admin",
                LastName = "SeedHR",
                Phone = "+90 532 111 2233",
                DateOfBirth = new DateTime(1985, 5, 12),
                Gender = "Male",
                IdentityNumber = "11111111111",
                Address = "İstanbul, Türkiye",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_yon",
                PositionId = "pos_gm",
                ManagerId = null,
                HireDate = DateTime.UtcNow.AddYears(-3),
                EmergencyContactName = "Destek",
                EmergencyContactPhone = "+90 532 111 2233",
                RoleId = "role_admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_hr",
                Email = "hr",
                PasswordHash = ikHash,
                FirstName = "Ayşe",
                LastName = "Kaya",
                Phone = "+90 532 222 3344",
                DateOfBirth = new DateTime(1990, 8, 20),
                Gender = "Female",
                IdentityNumber = "22222222222",
                Address = "Kadıköy, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_ik",
                PositionId = "pos_ik_mudur",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-2),
                EmergencyContactName = "Mehmet Kaya",
                EmergencyContactPhone = "+90 532 222 3345",
                RoleId = "role_hr",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_manager",
                Email = "manager",
                PasswordHash = managerHash,
                FirstName = "Can",
                LastName = "Demir",
                Phone = "+90 532 333 4455",
                DateOfBirth = new DateTime(1988, 3, 15),
                Gender = "Male",
                IdentityNumber = "33333333333",
                Address = "Beşiktaş, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_it",
                PositionId = "pos_bt_mudur",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-2),
                EmergencyContactName = "Elif Demir",
                EmergencyContactPhone = "+90 532 333 4456",
                RoleId = "role_manager",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_employee",
                Email = "employee",
                PasswordHash = empHash,
                FirstName = "Ahmet",
                LastName = "Yılmaz",
                Phone = "+90 532 444 5566",
                DateOfBirth = new DateTime(1993, 11, 5),
                Gender = "Male",
                IdentityNumber = "44444444444",
                Address = "Üsküdar, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_it",
                PositionId = "pos_yazilim_uzmani",
                ManagerId = "user_manager",
                HireDate = DateTime.UtcNow.AddMonths(-6),
                EmergencyContactName = "Zeynep Yılmaz",
                EmergencyContactPhone = "+90 532 444 5567",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            // --- 20 REALISTIC ADDITIONAL TURKISH EMPLOYEES ---
            new User
            {
                Id = "user_mehmet",
                Email = "mehmet.yilmaz@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Mehmet",
                LastName = "Yılmaz",
                Phone = "+90 533 123 4567",
                DateOfBirth = new DateTime(1994, 2, 10),
                Gender = "Male",
                IdentityNumber = "50000000001",
                Address = "Maltepe, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_it",
                PositionId = "pos_yazilim_uzmani",
                ManagerId = "user_manager",
                HireDate = DateTime.UtcNow.AddYears(-1),
                EmergencyContactName = "Ali Yılmaz",
                EmergencyContactPhone = "+90 533 123 4568",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_zeynep",
                Email = "zeynep.demir@seedhr.com",
                PasswordHash = ikHash,
                FirstName = "Zeynep",
                LastName = "Demir",
                Phone = "+90 535 234 5678",
                DateOfBirth = new DateTime(1992, 4, 15),
                Gender = "Female",
                IdentityNumber = "50000000002",
                Address = "Kartal, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_ik",
                PositionId = "pos_ik_uzmani",
                ManagerId = "user_hr",
                HireDate = DateTime.UtcNow.AddYears(-2),
                EmergencyContactName = "Sibel Demir",
                EmergencyContactPhone = "+90 535 234 5679",
                RoleId = "role_hr",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_ali",
                Email = "ali.kaya@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Ali",
                LastName = "Kaya",
                Phone = "+90 536 345 6789",
                DateOfBirth = new DateTime(1989, 6, 20),
                Gender = "Male",
                IdentityNumber = "50000000003",
                Address = "Pendik, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_fin",
                PositionId = "pos_muhasebe_uzmani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-3),
                EmergencyContactName = "Mustafa Kaya",
                EmergencyContactPhone = "+90 536 345 6780",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_fatma",
                Email = "fatma.sahin@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Fatma",
                LastName = "Şahin",
                Phone = "+90 537 456 7890",
                DateOfBirth = new DateTime(1991, 8, 25),
                Gender = "Female",
                IdentityNumber = "50000000004",
                Address = "Ataşehir, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_sat",
                PositionId = "pos_satis_temsilcisi",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddMonths(-9),
                EmergencyContactName = "Yusuf Şahin",
                EmergencyContactPhone = "+90 537 456 7891",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_mustafa",
                Email = "mustafa.celik@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Mustafa",
                LastName = "Çelik",
                Phone = "+90 538 567 8901",
                DateOfBirth = new DateTime(1995, 10, 30),
                Gender = "Male",
                IdentityNumber = "50000000005",
                Address = "Şişli, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_paz",
                PositionId = "pos_paz_uzmani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-1),
                EmergencyContactName = "Zehra Çelik",
                EmergencyContactPhone = "+90 538 567 8902",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_emine",
                Email = "emine.yildiz@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Emine",
                LastName = "Yıldız",
                Phone = "+90 539 678 9012",
                DateOfBirth = new DateTime(1993, 12, 12),
                Gender = "Female",
                IdentityNumber = "50000000006",
                Address = "Fatih, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_op",
                PositionId = "pos_op_uzmani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddMonths(-18),
                EmergencyContactName = "Hasan Yıldız",
                EmergencyContactPhone = "+90 539 678 9013",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_ahmet_o",
                Email = "ahmet.ozturk@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Ahmet",
                LastName = "Öztürk",
                Phone = "+90 541 789 0123",
                DateOfBirth = new DateTime(1987, 1, 5),
                Gender = "Male",
                IdentityNumber = "50000000007",
                Address = "Sarıyer, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_idari",
                PositionId = "pos_idari_uzmani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-4),
                EmergencyContactName = "Meryem Öztürk",
                EmergencyContactPhone = "+90 541 789 0124",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_hatice",
                Email = "hatice.arslan@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Hatice",
                LastName = "Arslan",
                Phone = "+90 542 890 1234",
                DateOfBirth = new DateTime(1996, 3, 18),
                Gender = "Female",
                IdentityNumber = "50000000008",
                Address = "Bakırköy, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_it",
                PositionId = "pos_yazilim_uzmani",
                ManagerId = "user_manager",
                HireDate = DateTime.UtcNow.AddMonths(-8),
                EmergencyContactName = "Veli Arslan",
                EmergencyContactPhone = "+90 542 890 1235",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_omer",
                Email = "omer.polat@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Ömer",
                LastName = "Polat",
                Phone = "+90 543 901 2345",
                DateOfBirth = new DateTime(1990, 5, 22),
                Gender = "Male",
                IdentityNumber = "50000000009",
                Address = "Bahçelievler, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_guv",
                PositionId = "pos_guvenlik_gorevlisi",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-2),
                EmergencyContactName = "Esma Polat",
                EmergencyContactPhone = "+90 543 901 2346",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_ayse_t",
                Email = "ayse.turan@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Ayşe",
                LastName = "Turan",
                Phone = "+90 544 012 3456",
                DateOfBirth = new DateTime(1985, 7, 30),
                Gender = "Female",
                IdentityNumber = "50000000010",
                Address = "Zeytinburnu, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_temizlik",
                PositionId = "pos_destek_elemani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-3),
                EmergencyContactName = "Kemal Turan",
                EmergencyContactPhone = "+90 544 012 3457",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_murat",
                Email = "murat.avci@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Murat",
                LastName = "Avcı",
                Phone = "+90 545 123 4567",
                DateOfBirth = new DateTime(1992, 9, 14),
                Gender = "Male",
                IdentityNumber = "50000000011",
                Address = "Tuzla, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_sat",
                PositionId = "pos_satis_temsilcisi",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddMonths(-11),
                EmergencyContactName = "Ayten Avcı",
                EmergencyContactPhone = "+90 545 123 4568",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_yasemin",
                Email = "yasemin.aydin@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Yasemin",
                LastName = "Aydın",
                Phone = "+90 546 234 5678",
                DateOfBirth = new DateTime(1994, 11, 28),
                Gender = "Female",
                IdentityNumber = "50000000012",
                Address = "Beylikdüzü, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_paz",
                PositionId = "pos_paz_uzmani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-1),
                EmergencyContactName = "Cem Aydın",
                EmergencyContactPhone = "+90 546 234 5679",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_huseyin",
                Email = "huseyin.kose@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Hüseyin",
                LastName = "Köse",
                Phone = "+90 547 345 6789",
                DateOfBirth = new DateTime(1986, 2, 8),
                Gender = "Male",
                IdentityNumber = "50000000013",
                Address = "Avcılar, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_fin",
                PositionId = "pos_muhasebe_uzmani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-5),
                EmergencyContactName = "Kezban Köse",
                EmergencyContactPhone = "+90 547 345 6780",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_dilek",
                Email = "dilek.cetinkaya@seedhr.com",
                PasswordHash = ikHash,
                FirstName = "Dilek",
                LastName = "Çetinkaya",
                Phone = "+90 548 456 7890",
                DateOfBirth = new DateTime(1991, 4, 19),
                Gender = "Female",
                IdentityNumber = "50000000014",
                Address = "Beşiktaş, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_ik",
                PositionId = "pos_ik_uzmani",
                ManagerId = "user_hr",
                HireDate = DateTime.UtcNow.AddMonths(-15),
                EmergencyContactName = "Recep Çetinkaya",
                EmergencyContactPhone = "+90 548 456 7891",
                RoleId = "role_hr",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_gokhan",
                Email = "gokhan.aslan@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Gökhan",
                LastName = "Aslan",
                Phone = "+90 549 567 8901",
                DateOfBirth = new DateTime(1995, 6, 24),
                Gender = "Male",
                IdentityNumber = "50000000015",
                Address = "Esenyurt, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_it",
                PositionId = "pos_yazilim_uzmani",
                ManagerId = "user_manager",
                HireDate = DateTime.UtcNow.AddMonths(-7),
                EmergencyContactName = "Fatma Aslan",
                EmergencyContactPhone = "+90 549 567 8902",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_seda",
                Email = "seda.yalcin@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Seda",
                LastName = "Yalçın",
                Phone = "+90 551 678 9012",
                DateOfBirth = new DateTime(1993, 8, 11),
                Gender = "Female",
                IdentityNumber = "50000000016",
                Address = "Küçükçekmece, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_op",
                PositionId = "pos_op_uzmani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-1),
                EmergencyContactName = "Bülent Yalçın",
                EmergencyContactPhone = "+90 551 678 9013",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_ibrahim",
                Email = "ibrahim.bulut@seedhr.com",
                PasswordHash = empHash,
                FirstName = "İbrahim",
                LastName = "Bulut",
                Phone = "+90 552 890 1234",
                DateOfBirth = new DateTime(1988, 10, 5),
                Gender = "Male",
                IdentityNumber = "50000000017",
                Address = "Güngören, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_guv",
                PositionId = "pos_guvenlik_gorevlisi",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-3),
                EmergencyContactName = "Hacer Bulut",
                EmergencyContactPhone = "+90 552 890 1235",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_filiz",
                Email = "filiz.erdogan@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Filiz",
                LastName = "Erdoğan",
                Phone = "+90 553 901 2345",
                DateOfBirth = new DateTime(1984, 12, 19),
                Gender = "Female",
                IdentityNumber = "50000000018",
                Address = "Bağcılar, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_temizlik",
                PositionId = "pos_destek_elemani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-4),
                EmergencyContactName = "Nuri Erdoğan",
                EmergencyContactPhone = "+90 553 901 2346",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_serkan",
                Email = "serkan.aksoy@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Serkan",
                LastName = "Aksoy",
                Phone = "+90 554 012 3456",
                DateOfBirth = new DateTime(1990, 2, 28),
                Gender = "Male",
                IdentityNumber = "50000000019",
                Address = "Eyüp, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_idari",
                PositionId = "pos_idari_uzmani",
                ManagerId = "user_admin",
                HireDate = DateTime.UtcNow.AddYears(-2),
                EmergencyContactName = "Derya Aksoy",
                EmergencyContactPhone = "+90 554 012 3457",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "user_merve",
                Email = "merve.kilic@seedhr.com",
                PasswordHash = empHash,
                FirstName = "Merve",
                LastName = "Kılıç",
                Phone = "+90 555 123 4567",
                DateOfBirth = new DateTime(1995, 4, 14),
                Gender = "Female",
                IdentityNumber = "50000000020",
                Address = "Kağıthane, İstanbul",
                City = "İstanbul",
                Country = "Türkiye",
                DepartmentId = "dept_it",
                PositionId = "pos_yazilim_uzmani",
                ManagerId = "user_manager",
                HireDate = DateTime.UtcNow.AddMonths(-10),
                EmergencyContactName = "Orhan Kılıç",
                EmergencyContactPhone = "+90 555 123 4568",
                RoleId = "role_employee",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        var locations = new[] { "İstanbul Merkez", "Ankara Şube", "İzmir Fabrika" };
        int userLocIdx = 0;
        foreach (var u in users)
        {
            u.Department = depts.Find(d => d.Id == u.DepartmentId);
            u.Position = positions.Find(p => p.Id == u.PositionId);
            u.Role = roles.Find(r => r.Id == u.RoleId);
            u.Location = locations[userLocIdx++ % locations.Length];
            await context.Users.InsertOneAsync(u);
        }

        // 5. Seed Announcements
        var announcements = new List<Announcement>
        {
            new Announcement
            {
                Id = "ann_1",
                Title = "Yeni SeedHR Portalına Hoş Geldiniz!",
                Content = "Tüm çalışanlarımız için tasarlanan yeni SeedHR İK yönetim portalı yayına alınmıştır. Artık izin taleplerinizi, katılım kayıtlarınızı ve performans hedeflerinizi bu platform üzerinden takip edebilirsiniz.",
                Category = "Company",
                Status = "Published",
                PublishedDate = DateTime.UtcNow.AddDays(-2),
                CreatedBy = "user_admin",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new Announcement
            {
                Id = "ann_2",
                Title = "Yıllık İzin Girişleri ve Güncellemeleri",
                Content = "Yaz dönemi planlamaları kapsamında tüm çalışanlarımızın bekleyen yıllık izin taleplerini İK sistemine en geç bu Cuma gününe kadar girmelerini önemle rica ederiz.",
                Category = "HR",
                Status = "Published",
                PublishedDate = DateTime.UtcNow.AddDays(-1),
                CreatedBy = "user_hr",
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Announcement
            {
                Id = "ann_3",
                Title = "Günün Nefis Yemek Menüsü",
                Content = "Ezogelin Çorbası\nKadınbudu Köfte\nPirinç Pilavı\nMevsim Salatası\nKemalpaşa Tatlısı",
                Category = "YemekMenusu",
                Status = "Published",
                PublishedDate = DateTime.UtcNow,
                CreatedBy = "Sistem Yönetici",
                CreatedAt = DateTime.UtcNow
            }
        };
        await context.Announcements.InsertManyAsync(announcements);

        // 6. Seed Attendance Records
        var today = DateTime.UtcNow.Date;
        var attendances = new List<Attendance>
        {
            new Attendance
            {
                Id = "att_admin",
                UserId = "user_admin",
                WorkScheduleId = "default",
                CheckInTime = today.AddHours(5).AddMinutes(45), // 08:45 AM UTC (05:45 + 3 = 08:45 in Turkey)
                CheckOutTime = today.AddHours(14).AddMinutes(30), // 17:30 PM UTC
                Status = "Present",
                Notes = "Ofisten çalışma",
                CreatedAt = DateTime.UtcNow
            },
            new Attendance
            {
                Id = "att_hr",
                UserId = "user_hr",
                WorkScheduleId = "default",
                CheckInTime = today.AddHours(5).AddMinutes(50), // 08:50 AM UTC
                CheckOutTime = today.AddHours(14).AddMinutes(45), // 17:45 PM UTC
                Status = "Present",
                Notes = "Zamanında katılım",
                CreatedAt = DateTime.UtcNow
            },
            new Attendance
            {
                Id = "att_manager",
                UserId = "user_manager",
                WorkScheduleId = "default",
                CheckInTime = today.AddHours(6).AddMinutes(15), // 09:15 AM UTC (Late checkin)
                CheckOutTime = null,
                Status = "Late",
                Notes = "Trafik nedeniyle gecikme",
                CreatedAt = DateTime.UtcNow
            }
        };
        await context.Attendances.InsertManyAsync(attendances);

        // 7. Seed Leave Requests
        var leaves = new List<LeaveRequest>
        {
            new LeaveRequest
            {
                Id = "leave_emp",
                UserId = "user_employee",
                LeaveTypeId = "leave_annual", // Just placeholder id since types aren't fully seeded here
                StartDate = today.AddDays(5),
                EndDate = today.AddDays(10),
                DaysRequested = 5,
                Reason = "Yaz Tatili Planı",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            }
        };
        await context.LeaveRequests.InsertManyAsync(leaves);

        // 8. Seed Performance Evaluations
        var evals = new List<PerformanceEvaluation>
        {
            new PerformanceEvaluation
            {
                Id = "eval_emp",
                UserId = "user_employee",
                EvaluatedBy = "user_manager",
                Period = "2026-Q1",
                Rating = 4,
                Comments = "Genel olarak yüksek performans ve uyum.",
                EvaluationDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            }
        };
        await context.PerformanceEvaluations.InsertManyAsync(evals);

        // 9. Seed Job Postings
        var postings = new List<JobPosting>
        {
            new JobPosting
            {
                Id = "job_1",
                Title = "Kıdemli .NET Geliştirici",
                Description = "Yazılım geliştirme ekibimizde yer alacak, .NET Core ve mikroservis mimarisine hakim çalışma arkadaşları arıyoruz.",
                PositionId = "pos_yazilim_uzmani",
                Requirements = "Kazanımlar: C#, .NET Core, MongoDB deneyimi",
                Status = "Open",
                PostedDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            }
        };
        await context.JobPostings.InsertManyAsync(postings);

        // 10. Seed Leave Types
        var leaveTypes = new List<LeaveType>
        {
            new LeaveType { Id = "lt_annual", Name = "Yıllık İzin", Code = "YILLIK", Description = "Yıllık ücretli izin", DefaultDays = 15, RequiresApproval = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new LeaveType { Id = "lt_sick", Name = "Hastalık İzni", Code = "HASTALIK", Description = "Hastalık nedeniyle kullanılan izin", DefaultDays = 10, RequiresApproval = false, IsActive = true, CreatedAt = DateTime.UtcNow },
            new LeaveType { Id = "lt_excuse", Name = "Mazeret İzni", Code = "MAZERET", Description = "Özel durum ve mazeret izni", DefaultDays = 5, RequiresApproval = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new LeaveType { Id = "lt_unpaid", Name = "Ücretsiz İzin", Code = "UCRETSIZ", Description = "Ücretsiz olarak kullanılan ek izin", DefaultDays = 30, RequiresApproval = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new LeaveType { Id = "lt_maternity", Name = "Doğum/Babalık İzni", Code = "DOGUM", Description = "Doğum ve babalık izni", DefaultDays = 60, RequiresApproval = true, IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        await context.LeaveTypes.InsertManyAsync(leaveTypes);

        // 11. Seed Leave Balances for all users
        var currentYear = DateTime.UtcNow.Year;
        var userIds = new[] { "user_admin", "user_hr", "user_manager", "user_employee" };
        var balancesToInsert = new List<LeaveBalance>();
        int balIdx = 0;
        foreach (var uid in userIds)
        {
            foreach (var lt in leaveTypes)
            {
                balancesToInsert.Add(new LeaveBalance
                {
                    Id = $"lb_{balIdx++}",
                    UserId = uid,
                    LeaveTypeId = lt.Id,
                    Year = currentYear,
                    TotalDays = lt.DefaultDays,
                    UsedDays = 0,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
        await context.LeaveBalances.InsertManyAsync(balancesToInsert);

        // 12. Seed Candidates
        var candidateCVContent = System.Text.Encoding.UTF8.GetBytes("%PDF-1.4\n%쏢\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/MediaBox [0 0 595.275 841.89]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<< /Length 52 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(Mock Resume for Candidate Evaluation) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000015 00000 n\n0000000074 00000 n\n0000000139 00000 n\n0000000318 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n419\n%%EOF");
        var candidate1 = new Candidate
        {
            Id = "candidate_1",
            FirstName = "Kaan",
            LastName = "Yılmaz",
            Email = "kaan.yilmaz@test.com",
            Phone = "+90 532 999 8877",
            Address = "Beşiktaş",
            City = "İstanbul",
            Country = "Türkiye",
            CVPath = "seeded_cv.pdf",
            CVContent = candidateCVContent,
            CVFileName = "Kaan_Yilmaz_CV.pdf",
            CVContentType = "application/pdf",
            CoverLetter = "Merhaba, Kıdemli .NET Geliştirici pozisyonu için başvuruyorum. C# ve .NET Core konularında 5 yıllık deneyimim bulunmaktadır.",
            AppliedDate = DateTime.UtcNow.AddDays(-2),
            Status = "New",
            AiMatchScore = 88,
            Applications = new List<CandidateApplication>
            {
                new CandidateApplication
                {
                    Id = "app_1",
                    JobPostingId = "job_1",
                    ApplicationDate = DateTime.UtcNow.AddDays(-2),
                    Status = "Applied"
                }
            }
        };

        var candidate2 = new Candidate
        {
            Id = "candidate_2",
            FirstName = "Merve",
            LastName = "Demir",
            Email = "merve.demir@test.com",
            Phone = "+90 533 888 7766",
            Address = "Kadıköy",
            City = "İstanbul",
            Country = "Türkiye",
            CVPath = "seeded_cv.pdf",
            CVContent = candidateCVContent,
            CVFileName = "Merve_Demir_CV.pdf",
            CVContentType = "application/pdf",
            CoverLetter = "Yazılım ekibinize katkıda bulunmaktan mutluluk duyarım. React, Next.js ve Node.js teknolojilerinde uzmanım.",
            AppliedDate = DateTime.UtcNow.AddDays(-1),
            Status = "Shortlisted",
            AiMatchScore = 94,
            Applications = new List<CandidateApplication>
            {
                new CandidateApplication
                {
                    Id = "app_2",
                    JobPostingId = "job_1",
                    ApplicationDate = DateTime.UtcNow.AddDays(-1),
                    Status = "Applied"
                }
            }
        };

        await context.Candidates.InsertManyAsync(new List<Candidate> { candidate1, candidate2 });

        // 13. Seed Work Schedules (Vardiya / Çalışma Takvimi)
        var schedules = new List<WorkSchedule>();
        var startDate = DateTime.UtcNow.Date.AddDays(-40);
        var endDate = DateTime.UtcNow.Date.AddDays(40);

        int scheduleIdx = 1;
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;
            var type = isWeekend ? "Weekend" : "Working";
            var desc = isWeekend ? "Hafta Sonu Tatili" : "Standart Mesai (09:00 - 18:00)";

            // Special days
            if (date == DateTime.UtcNow.Date.AddDays(-5))
            {
                type = "Holiday";
                desc = "Şirket İçi Eğitim Günü (Mesai Yok)";
            }
            else if (date == DateTime.UtcNow.Date.AddDays(10))
            {
                type = "Holiday";
                desc = "Resmi Tatil";
            }
            else if (date == DateTime.UtcNow.Date.AddDays(15))
            {
                type = "Working";
                desc = "Yarım Gün Mesai (09:00 - 13:00)";
            }

            schedules.Add(new WorkSchedule
            {
                Id = $"ws_{scheduleIdx++}",
                Date = date,
                Type = type,
                Description = desc,
                DayOfWeek = (int)date.DayOfWeek,
                CreatedAt = DateTime.UtcNow
            });
        }
        await context.WorkSchedules.InsertManyAsync(schedules);

        // 14. Seed LMS Courses
        var courses = new List<Course>
        {
            new Course
            {
                Id = "course_isg",
                Title = "İş Sağlığı ve Güvenliği (İSG) Eğitimi",
                Description = "Yasal olarak zorunlu genel iş sağlığı ve güvenliği eğitimi.",
                Type = "Online",
                DurationHours = 4,
                Provider = "SeedHR Akademi",
                DocumentUrl = "https://example.com/isg-kurs-dokumani.pdf",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new Course
            {
                Id = "course_cyber",
                Title = "Siber Güvenlik Farkındalık Eğitimi",
                Description = "Şirket içi bilgi güvenliği kuralları ve sosyal mühendislik saldırıları farkındalık eğitimi.",
                Type = "Online",
                DurationHours = 2,
                Provider = "IT Güvenlik Ekibi",
                DocumentUrl = "https://example.com/cyber-security-awareness.pdf",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new Course
            {
                Id = "course_kvkk",
                Title = "KVKK ve Kişisel Verilerin Korunması Eğitimi",
                Description = "Kişisel Verilerin Korunması Kanunu kapsamında uyulması gereken veri işleme kuralları.",
                Type = "Online",
                DurationHours = 3,
                Provider = "Hukuk Departmanı",
                DocumentUrl = "https://example.com/kvkk-egitim.pdf",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };
        await context.Courses.InsertManyAsync(courses);

        // 15. Seed Course Assignments
        var courseAssignments = new List<CourseAssignment>
        {
            new CourseAssignment
            {
                Id = "assign_1",
                CourseId = "course_isg",
                UserId = "user_employee",
                AssignedBy = "user_hr",
                AssignedDate = DateTime.UtcNow.AddDays(-10),
                CompletedDate = DateTime.UtcNow.AddDays(-8),
                Status = "Completed",
                CertificateUrl = "https://example.com/certificates/cert_isg_ahmet.pdf",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new CourseAssignment
            {
                Id = "assign_2",
                CourseId = "course_cyber",
                UserId = "user_employee",
                AssignedBy = "user_hr",
                AssignedDate = DateTime.UtcNow.AddDays(-5),
                CompletedDate = null,
                Status = "Assigned",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new CourseAssignment
            {
                Id = "assign_3",
                CourseId = "course_isg",
                UserId = "user_mehmet",
                AssignedBy = "user_hr",
                AssignedDate = DateTime.UtcNow.AddDays(-10),
                CompletedDate = DateTime.UtcNow.AddDays(-8),
                Status = "Completed",
                CertificateUrl = "https://example.com/certificates/cert_isg_mehmet.pdf",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };
        await context.CourseAssignments.InsertManyAsync(courseAssignments);

        // 16. Seed Competency Forms
        var competencyForms = new List<CompetencyForm>
        {
            new CompetencyForm
            {
                Id = "comp_form_it",
                DepartmentId = "dept_it",
                Title = "Yazılım Geliştirici Değerlendirme Şablonu",
                Description = "Yazılım geliştirici kadrosundaki çalışanlar için yetkinlik değerlendirme şablonu.",
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                Competencies = new List<CompetencyItem>
                {
                    new CompetencyItem { Id = "comp_it_1", Category = "Technical", Question = "Teknik Bilgi & Kod Kalitesi: Temiz kod prensipleri ve mimari standartlara uyum.", Weight = 40.0 },
                    new CompetencyItem { Id = "comp_it_2", Category = "Soft Skills", Question = "Problem Çözme Yeteneği: Karmaşık hataları çözme ve analitik yaklaşım.", Weight = 30.0 },
                    new CompetencyItem { Id = "comp_it_3", Category = "Soft Skills", Question = "İletişim & Takım Çalışması: Ekip arkadaşlarıyla uyum ve bilgi paylaşımı.", Weight = 30.0 }
                }
            }
        };
        await context.CompetencyForms.InsertManyAsync(competencyForms);

        // 17. Seed Evaluations 360
        var evaluations360 = new List<Evaluation360>
        {
            new Evaluation360
            {
                Id = "eval360_1",
                EmployeeId = "user_employee",
                EvaluatorId = "user_manager",
                EvaluatorType = "Manager",
                CompetencyFormId = "comp_form_it",
                Scores = new Dictionary<string, int>
                {
                    { "comp_it_1", 5 },
                    { "comp_it_2", 4 },
                    { "comp_it_3", 4 }
                },
                Feedback = "Ahmet teknik olarak çok güçlü bir çalışan. İletişimini daha da geliştirebilir.",
                Status = "Submitted",
                Period = "2026 Q2",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                IsActive = true
            },
            new Evaluation360
            {
                Id = "eval360_2",
                EmployeeId = "user_employee",
                EvaluatorId = "user_mehmet",
                EvaluatorType = "Peer",
                CompetencyFormId = "comp_form_it",
                Scores = new Dictionary<string, int>
                {
                    { "comp_it_1", 4 },
                    { "comp_it_2", 5 },
                    { "comp_it_3", 4 }
                },
                Feedback = "Harika bir takım arkadaşı, her zaman yardıma hazır.",
                Status = "Submitted",
                Period = "2026 Q2",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                IsActive = true
            },
            new Evaluation360
            {
                Id = "eval360_3",
                EmployeeId = "user_employee",
                EvaluatorId = "user_employee",
                EvaluatorType = "Self",
                CompetencyFormId = "comp_form_it",
                Scores = new Dictionary<string, int>
                {
                    { "comp_it_1", 4 },
                    { "comp_it_2", 4 },
                    { "comp_it_3", 4 }
                },
                Feedback = "Bu dönem hedeflerimi başarıyla gerçekleştirdiğimi düşünüyorum. Teknik olarak kendimi geliştirdim.",
                Status = "Submitted",
                Period = "2026 Q2",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                IsActive = true
            }
        };
        await context.Evaluations360.InsertManyAsync(evaluations360);

        // 18. Seed Reference Checks
        var referenceChecks = new List<ReferenceCheck>
        {
            new ReferenceCheck
            {
                Id = "ref_check_1",
                CandidateId = "candidate_2",
                ReferenceName = "Hakan Aydın",
                Company = "Tekno Soft",
                Title = "Yazılım Mimarı",
                Email = "hakan.aydin@teknosoft.com",
                Phone = "+90 532 777 6655",
                Relationship = "Former Manager",
                Status = "Completed",
                VerificationNotes = "Merve Hanım ile 2 yıl boyunca aynı projelerde çalıştık.",
                Scores = new Dictionary<string, int>
                {
                    { "Teknik Beceri", 5 },
                    { "Uyum / Takım Çalışması", 5 },
                    { "Girişkenlik / Sorumluluk", 5 }
                },
                Comments = "Merve mükemmel bir takım arkadaşı ve teknik bilgisi çok üst düzeydedir. Kesinlikle öneririm.",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                IsActive = true
            }
        };
        await context.ReferenceChecks.InsertManyAsync(referenceChecks);

        // 19. Seed Payrolls
        var payrolls = new List<Payroll>
        {
            new Payroll
            {
                Id = "payroll_1",
                UserId = "user_employee",
                Period = "2026-05",
                BaseSalary = 45000,
                OvertimeHours = 8,
                OvertimeRate = 300,
                Bonus = 2000,
                Deductions = 500,
                GrossSalary = 49400,
                TaxAmount = 7410,
                NetSalary = 41490,
                Status = "Paid",
                PaymentDate = DateTime.UtcNow.AddDays(-5),
                Notes = "Mayıs 2026 maaş ödemesi",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                IsActive = true
            },
            new Payroll
            {
                Id = "payroll_2",
                UserId = "user_hr",
                Period = "2026-05",
                BaseSalary = 60000,
                OvertimeHours = 0,
                OvertimeRate = 400,
                Bonus = 5000,
                Deductions = 0,
                GrossSalary = 65000,
                TaxAmount = 9750,
                NetSalary = 55250,
                Status = "Paid",
                PaymentDate = DateTime.UtcNow.AddDays(-5),
                Notes = "Mayıs 2026 maaş ödemesi + prim",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                IsActive = true
            }
        };
        await context.Payrolls.InsertManyAsync(payrolls);

        // 20. Seed Expense Requests
        var expenses = new List<ExpenseRequest>
        {
            new ExpenseRequest
            {
                Id = "expense_1",
                UserId = "user_employee",
                Amount = 1250,
                Currency = "TRY",
                Category = "Meals",
                Description = "Müşteri akşam yemeği ağırlaması",
                Status = "Approved",
                ApprovedBy = "user_manager",
                ApprovedDate = DateTime.UtcNow.AddDays(-2),
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                IsActive = true
            },
            new ExpenseRequest
            {
                Id = "expense_2",
                UserId = "user_employee",
                Amount = 3500,
                Currency = "TRY",
                Category = "Travel",
                Description = "Ankara şube ziyareti uçak bileti",
                Status = "Pending",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                IsActive = true
            }
        };
        await context.ExpenseRequests.InsertManyAsync(expenses);

        // 21. Seed Employee Shifts (Vardiya planı)
        var shifts = new List<EmployeeShift>();
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek + 1); // Monday
        var shiftTypes = new[] { "Morning", "Evening", "Night", "Off" };
        var employees = new[] { "user_employee", "user_mehmet", "user_hatice", "user_merve" };

        int shiftIdCounter = 1;
        for (int i = 0; i < employees.Length; i++)
        {
            for (int day = 0; day < 7; day++)
            {
                var date = startOfWeek.AddDays(day);
                var shiftType = shiftTypes[(i + day) % 4];
                string startTime = "08:00";
                string endTime = "16:00";
                if (shiftType == "Evening") { startTime = "16:00"; endTime = "00:00"; }
                else if (shiftType == "Night") { startTime = "00:00"; endTime = "08:00"; }
                else if (shiftType == "Off") { startTime = "00:00"; endTime = "00:00"; }

                shifts.Add(new EmployeeShift
                {
                    Id = $"shift_{shiftIdCounter++}",
                    UserId = employees[i],
                    Date = date,
                    ShiftType = shiftType,
                    StartTime = startTime,
                    EndTime = endTime,
                    Notes = day == 6 && shiftType != "Off" ? "Hafta sonu nöbeti" : null,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }
        }
        await context.EmployeeShifts.InsertManyAsync(shifts);

        // 22. Seed Visitor Logs
        var visitors = new List<VisitorLog>
        {
            new VisitorLog
            {
                Id = "visitor_1",
                VisitorName = "Murat Can",
                Company = "Google",
                Purpose = "Partnerlik ve Entegrasyon Görüşmesi",
                HostUserId = "user_manager",
                HostUserName = "Can Demir",
                EntryTime = DateTime.UtcNow.AddHours(-2),
                Status = "CheckedIn",
                BadgeNumber = "B-201",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new VisitorLog
            {
                Id = "visitor_2",
                VisitorName = "Elif Yıldırım",
                Company = "Karya Danışmanlık",
                Purpose = "İK Süreçleri Danışmanlığı",
                HostUserId = "user_hr",
                HostUserName = "Ayşe Kaya",
                Status = "Expected",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };
        await context.VisitorLogs.InsertManyAsync(visitors);
    }
}
