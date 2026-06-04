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

        foreach (var u in users)
        {
            u.Department = depts.Find(d => d.Id == u.DepartmentId);
            u.Position = positions.Find(p => p.Id == u.PositionId);
            u.Role = roles.Find(r => r.Id == u.RoleId);
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
    }
}
